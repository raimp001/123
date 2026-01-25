import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createLabSchema = z.object({
  name: z.string().min(2).max(200),
  institution: z.string().optional(),
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  country: z.string().optional(),
  expertise_areas: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  publications: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    year: z.number().optional(),
  })).default([]),
})

// GET /api/labs - List labs with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query params
    const search = searchParams.get('search')
    const verificationTier = searchParams.get('verification_tier')
    const expertise = searchParams.getAll('expertise')
    const minReputation = searchParams.get('minReputation')
    const sortBy = searchParams.get('sortBy') || 'reputation_score'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    let query = supabase
      .from('labs')
      .select(`
        *,
        user:users!labs_user_id_fkey(id, full_name, avatar_url, email),
        completed_bounties:bounties(count),
        active_proposals:proposals(count)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,institution.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    if (verificationTier) {
      query = query.eq('verification_tier', verificationTier)
    }

    if (expertise.length > 0) {
      query = query.contains('expertise_areas', expertise)
    }

    if (minReputation) {
      query = query.gte('reputation_score', parseFloat(minReputation))
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching labs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      labs: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/labs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/labs - Create or apply as a lab
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a lab profile
    const { data: existingLab } = await supabase
      .from('labs')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingLab) {
      return NextResponse.json({ error: 'You already have a lab profile' }, { status: 400 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createLabSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Create lab profile
    const { data: lab, error: labError } = await supabase
      .from('labs')
      .insert({
        ...validationResult.data,
        user_id: user.id,
        verification_tier: 'unverified',
        reputation_score: 0,
        is_active: true,
      })
      .select()
      .single()

    if (labError) {
      console.error('Error creating lab:', labError)
      return NextResponse.json({ error: labError.message }, { status: 500 })
    }

    // Update user role to 'lab'
    await supabase
      .from('users')
      .update({ role: 'lab' })
      .eq('id', user.id)

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'lab_created',
      details: { lab_id: lab.id, name: lab.name },
    })

    return NextResponse.json(lab, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/labs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
