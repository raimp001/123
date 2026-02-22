/**
 * lib/ipfs/pin.ts — Pinata IPFS pinning helper (hardened v2)
 *
 * Fixes applied:
 *  1. Multi-gateway failover (4 gateways, HEAD-probed)
 *  2. File size + MIME type validation (50 MB cap, allowlist)
 *  3. Exponential-backoff retry on 5xx / network errors (3 attempts)
 *  4. CID format validation after every upload
 *  5. Eager credential check on module load
 *  6. Duplicate-pin detection via Pinata list API
 *  7. ReadableStream support (fixes broken JSDoc contract)
 */

export interface PinResult {
  cid: string
  url: string
  size: number
}

const PINATA_API = 'https://api.pinata.cloud'

/** Fix #1 — 4 gateways tried in order on HEAD failure */
const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs',
]

/** Fix #2 — 50 MB max */
const MAX_FILE_BYTES = 50 * 1024 * 1024

/** Fix #2 — allowed MIME types */
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/json',
  'application/zip',
  'application/octet-stream',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'text/markdown',
])

/** Fix #5 — eager credential check on module load */
if (typeof process !== 'undefined') {
  const hasJwt = !!process.env.PINATA_JWT
  const hasLegacy = !!(process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET)
  if (!hasJwt && !hasLegacy) {
    console.error(
      '[pin.ts] WARNING: No Pinata credentials detected. ' +
      'Set PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET.'
    )
  }
}

function getPinataHeaders(): Record<string, string> {
  const jwt = process.env.PINATA_JWT
  if (jwt) return { Authorization: `Bearer ${jwt}` }
  const key = process.env.PINATA_API_KEY
  const secret = process.env.PINATA_API_SECRET
  if (key && secret) return { pinata_api_key: key, pinata_secret_api_key: secret }
  throw new Error(
    'Pinata credentials not configured. Set PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET.'
  )
}

/** Fix #1 — resolve fastest available gateway for a CID */
export async function resolveIpfsUrl(cid: string): Promise<string> {
  for (const gw of GATEWAYS) {
    try {
      const res = await fetch(`${gw}/${cid}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) return `${gw}/${cid}`
    } catch { /* try next */ }
  }
  return `${GATEWAYS[0]}/${cid}`
}

/** Fix #1 — build gateway URL (no network call) */
export function ipfsUrl(cid: string): string {
  return `${GATEWAYS[0]}/${cid}`
}

/** Fix #3 — fetch with exponential-backoff retry */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, init)
      if (res.ok || res.status < 500) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (err) {
      lastError = err
    }
    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500))
    }
  }
  throw lastError
}

/** Fix #4 — validate CID format returned by Pinata */
function assertValidCid(hash: string): void {
  const isCidV1 = /^b[a-z2-7]{58,}$/i.test(hash)
  const isCidV0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)
  if (!isCidV1 && !isCidV0) {
    throw new Error(
      `Invalid CID returned from Pinata: "${hash}". Refusing to store corrupt evidence hash.`
    )
  }
}

/** Fix #7 — convert ReadableStream to Buffer */
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }
  return Buffer.concat(chunks)
}

/** Fix #2 — validate file size and MIME type */
function validateFile(file: Buffer | Blob | File, fileName: string): void {
  const size = file instanceof Buffer ? file.byteLength : file.size
  if (size === 0) throw new Error(`File "${fileName}" is empty.`)
  if (size > MAX_FILE_BYTES) {
    throw new Error(
      `File "${fileName}" is ${(size / 1024 / 1024).toFixed(1)} MB, exceeds the 50 MB limit.`
    )
  }
  if (file instanceof File) {
    const mime = file.type || 'application/octet-stream'
    if (!ALLOWED_MIME.has(mime)) {
      throw new Error(
        `File type "${mime}" is not permitted. Allowed: ${[...ALLOWED_MIME].join(', ')}`
      )
    }
  }
}

/** Fix #6 — check for existing pin by name */
async function findExistingPin(
  name: string,
  headers: Record<string, string>
): Promise<PinResult | null> {
  try {
    const res = await fetch(
      `${PINATA_API}/data/pinList?metadata[name]=${encodeURIComponent(name)}&status=pinned&pageLimit=1`,
      { headers }
    )
    if (!res.ok) return null
    const list = (await res.json()) as { rows: Array<{ ipfs_pin_hash: string; size: number }> }
    if (list.rows.length > 0) {
      const pin = list.rows[0]
      console.info(`[pin.ts] Dedup: reusing existing pin "${name}" -> ${pin.ipfs_pin_hash}`)
      return { cid: pin.ipfs_pin_hash, url: ipfsUrl(pin.ipfs_pin_hash), size: pin.size }
    }
  } catch { /* dedup check is best-effort */ }
  return null
}

/**
 * Pins a file (Buffer | Blob | File | ReadableStream) to IPFS via Pinata.
 */
export async function pinFile(
  file: Buffer | Blob | File | ReadableStream<Uint8Array>,
  fileName: string,
  metadata?: Record<string, string>,
  dedup = true
): Promise<PinResult> {
  const resolved: Buffer | Blob | File =
    file instanceof ReadableStream ? await streamToBuffer(file) : file

  validateFile(resolved, fileName)

  const headers = getPinataHeaders()

  if (dedup) {
    const existing = await findExistingPin(fileName, headers)
    if (existing) return existing
  }

  const form = new FormData()
  const blob =
    resolved instanceof Buffer
      ? new Blob([resolved], { type: 'application/octet-stream' })
      : resolved
  form.append('file', blob, fileName)
  form.append(
    'pinataMetadata',
    JSON.stringify({ name: fileName, keyvalues: metadata ?? {} })
  )
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

  const res = await fetchWithRetry(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers,
    body: form,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`Pinata pinFile failed (${res.status}): ${detail}`)
  }

  const json = (await res.json()) as { IpfsHash: string; PinSize: number }
  assertValidCid(json.IpfsHash)

  return { cid: json.IpfsHash, url: ipfsUrl(json.IpfsHash), size: json.PinSize }
}

/**
 * Pins a JSON object to IPFS via Pinata.
 */
export async function pinJson(
  data: Record<string, unknown>,
  name: string,
  metadata?: Record<string, string>,
  dedup = true
): Promise<PinResult> {
  const headers = getPinataHeaders()

  if (dedup) {
    const existing = await findExistingPin(name, headers)
    if (existing) return existing
  }

  const body = {
    pinataContent: data,
    pinataMetadata: { name, keyvalues: metadata ?? {} },
    pinataOptions: { cidVersion: 1 },
  }

  const res = await fetchWithRetry(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new Error(`Pinata pinJson failed (${res.status}): ${detail}`)
  }

  const json = (await res.json()) as { IpfsHash: string; PinSize: number }
  assertValidCid(json.IpfsHash)

  return { cid: json.IpfsHash, url: ipfsUrl(json.IpfsHash), size: json.PinSize }
}
