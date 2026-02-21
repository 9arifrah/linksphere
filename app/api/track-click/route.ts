import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Increment click count
    const { error } = await supabase.rpc('increment_click_count', {
      link_id: linkId
    })

    if (error) {
      console.error('[v0] Error tracking click:', error)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in track-click API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
