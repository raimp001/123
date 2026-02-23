/**
 * app/api/bounties/[id]/irb/route.ts  (PR#3)
 *
 * POST  /api/bounties/:id/irb
 *   – Accepts multipart/form-data with a "file" field (PDF)
 *   – Uploads file to Supabase Storage (bucket: irb-documents)
 *   – Optionally pins to IPFS for immutability
 *   – Creates an irb_documents row and updates bounty.irb_status
 *
 * GET   /api/bounties/:id/irb
 *   – Returns latest IRB document for the bounty
 *   – Requires funder ownership OR admin role
 *
 * Auth:
 *   – Must be the funder who owns the bounty (or admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }             from '@/lib/supabase/server'
import { pinFile }                  from '@/lib/ipfs/pin'

type Ctx = { params: Promise<{ id: string }> }

// 20 MB limit for IRB PDFs
const MAX_BYTES = 20 * 1024 * 1024

// Allowed MIME types
const ALLOWED = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, { params }: Ctx) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: bountyId } = await params

  // Verify ownership or admin
  const { data: bounty } = await supabase
    .from('bounties')
    .select('funder_id')
    .eq('id', bountyId)
    .single()

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  if (bounty?.funder_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: doc } = await supabase
    .from('irb_documents')
    .select('*')
    .eq('bounty_id', bountyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ document: doc })
}

// ── POST ───────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, { params }: Ctx) {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: bountyId } = await params

  // Check bounty ownership
  const { data: bounty, error: bountyErr } = await supabase
    .from('bounties')
    .select('funder_id, title')
    .eq('id', bountyId)
    .single()

  if (bountyErr || !bounty) {
    return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  if (bounty.funder_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse form data
  let formData: FormData
  try { formData = await request.formData() }
  catch { return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 }) }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing "file" field' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 413 })
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PDF and Word documents are accepted' },
      { status: 415 }
    )
  }

  // 1) Upload to Supabase Storage
  const storageKey = `irb/${bountyId}/${Date.now()}_${file.name}`
  const arrayBuffer = await file.arrayBuffer()
  const { error: storageErr } = await supabase.storage
    .from('irb-documents')
    .upload(storageKey, arrayBuffer, { contentType: file.type, upsert: true })

  if (storageErr) {
    console.error('[irb] storage upload error:', storageErr)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }

  // 2) Get signed URL (1 week)
  const { data: signedUrl } = await supabase.storage
    .from('irb-documents')
    .createSignedUrl(storageKey, 60 * 60 * 24 * 7)

  // 3) Optionally pin to IPFS (best-effort, non-blocking)
  let ipfsHash: string | null = null
  try {
    const pin = await pinFile(file, file.name, {
      bounty_id:    bountyId,
      uploaded_by:  user.id,
      document_type: 'irb',
    })
    ipfsHash = pin.cid
  } catch (err) {
    // IRB upload still succeeds if IPFS is not configured
    console.warn('[irb] IPFS pin skipped:', err instanceof Error ? err.message : err)
  }

  // 4) Insert irb_documents row
  const now = new Date().toISOString()
  const { data: doc, error: insertErr } = await supabase
    .from('irb_documents')
    .insert({
      bounty_id:    bountyId,
      uploaded_by:  user.id,
      file_name:    file.name,
      storage_path: storageKey,
      public_url:   signedUrl?.signedUrl ?? null,
      ipfs_hash:    ipfsHash,
      status:       'uploaded',
      created_at:   now,
      updated_at:   now,
    })
    .select()
    .single()

  if (insertErr) {
    console.error('[irb] insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 })
  }

  // 5) Update bounty.irb_status
  await supabase
    .from('bounties')
    .update({ irb_status: 'uploaded', updated_at: now })
    .eq('id', bountyId)

  return NextResponse.json({
    document: doc,
    ipfs_hash: ipfsHash,
    message: 'IRB document uploaded. Pending admin verification.',
  })
}
