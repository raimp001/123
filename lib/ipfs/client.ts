/**
 * IPFS Client for Evidence Storage
 * 
 * Uses Pinata for pinning or can use local IPFS node.
 * Provides content-addressable storage with SHA-256 hashing.
 */

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY
const PINATA_JWT = process.env.PINATA_JWT

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface UploadResult {
  success: boolean
  hash?: string
  cid?: string
  size?: number
  url?: string
  error?: string
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadToIPFS(
  file: File | Blob,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || `sciflow-evidence-${Date.now()}`,
        keyvalues: metadata.keyvalues || {},
      }))
    }

    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
    }))

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload to IPFS')
    }

    const data: PinataResponse = await response.json()

    return {
      success: true,
      cid: data.IpfsHash,
      hash: data.IpfsHash,
      size: data.PinSize,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    }
  } catch (error) {
    console.error('IPFS upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Upload JSON data to IPFS
 */
export async function uploadJSONToIPFS(
  data: Record<string, unknown>,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<UploadResult> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: metadata?.name || `sciflow-data-${Date.now()}`,
          keyvalues: metadata?.keyvalues || {},
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to upload to IPFS')
    }

    const result: PinataResponse = await response.json()

    return {
      success: true,
      cid: result.IpfsHash,
      hash: result.IpfsHash,
      size: result.PinSize,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    }
  } catch (error) {
    console.error('IPFS JSON upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Calculate SHA-256 hash of file content
 */
export async function hashFile(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Upload evidence bundle - multiple files with metadata
 */
export async function uploadEvidenceBundle(
  files: File[],
  metadata: {
    bountyId: string
    milestoneId: string
    labId: string
    submissionNotes?: string
    timestamp: string
  }
): Promise<{
  success: boolean
  bundleHash?: string
  bundleCid?: string
  fileHashes?: Record<string, string>
  error?: string
}> {
  try {
    // Hash all files individually
    const fileHashes: Record<string, string> = {}
    const fileUploadPromises: Promise<UploadResult>[] = []

    for (const file of files) {
      const hash = await hashFile(file)
      fileHashes[file.name] = hash

      fileUploadPromises.push(
        uploadToIPFS(file, {
          name: `${metadata.bountyId}/${metadata.milestoneId}/${file.name}`,
          keyvalues: {
            bountyId: metadata.bountyId,
            milestoneId: metadata.milestoneId,
            labId: metadata.labId,
            sha256: hash,
          },
        })
      )
    }

    // Upload all files
    const uploadResults = await Promise.all(fileUploadPromises)
    
    // Check for failures
    const failures = uploadResults.filter(r => !r.success)
    if (failures.length > 0) {
      throw new Error(`Failed to upload ${failures.length} files`)
    }

    // Create evidence manifest
    const manifest = {
      version: '1.0',
      timestamp: metadata.timestamp,
      bountyId: metadata.bountyId,
      milestoneId: metadata.milestoneId,
      labId: metadata.labId,
      submissionNotes: metadata.submissionNotes,
      files: files.map((file, index) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        sha256: fileHashes[file.name],
        ipfsCid: uploadResults[index].cid,
        ipfsUrl: uploadResults[index].url,
      })),
    }

    // Upload manifest
    const manifestResult = await uploadJSONToIPFS(manifest, {
      name: `evidence-manifest-${metadata.milestoneId}`,
      keyvalues: {
        bountyId: metadata.bountyId,
        milestoneId: metadata.milestoneId,
        type: 'evidence-manifest',
      },
    })

    if (!manifestResult.success) {
      throw new Error('Failed to upload evidence manifest')
    }

    return {
      success: true,
      bundleHash: manifestResult.hash,
      bundleCid: manifestResult.cid,
      fileHashes,
    }
  } catch (error) {
    console.error('Evidence bundle upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Verify evidence by comparing hash
 */
export async function verifyEvidence(
  file: File | Blob,
  expectedHash: string
): Promise<{ valid: boolean; actualHash: string }> {
  const actualHash = await hashFile(file)
  return {
    valid: actualHash === expectedHash,
    actualHash,
  }
}

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS(cid: string): Promise<Response> {
  // Try multiple gateways
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ]

  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, { 
        signal: AbortSignal.timeout(10000) 
      })
      if (response.ok) return response
    } catch {
      continue
    }
  }

  throw new Error('Failed to fetch from IPFS')
}
