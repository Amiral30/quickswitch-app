import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Allow up to 60s for the AI processing

export async function POST(request: NextRequest) {
  const apiKey = process.env.CLIPDROP_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clipdrop API key not configured.' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const imageFile = formData.get('image_file') as File | null

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    // Forward the image to Clipdrop's background removal API
    const clipdropForm = new FormData()
    clipdropForm.append('image_file', imageFile, imageFile.name)

    const clipdropResponse = await fetch(
      'https://clipdrop-api.co/remove-background/v1',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: clipdropForm,
      }
    )

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text()
      console.error('Clipdrop API error:', clipdropResponse.status, errorText)

      if (clipdropResponse.status === 402) {
        return NextResponse.json(
          { error: 'Quota journalier atteint. Réessayez demain.' },
          { status: 402 }
        )
      }
      if (clipdropResponse.status === 401) {
        return NextResponse.json(
          { error: 'Clé API invalide.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: `Erreur API de détourage (${clipdropResponse.status}).` },
        { status: clipdropResponse.status }
      )
    }

    // Stream the PNG result back to the client
    const resultBuffer = await clipdropResponse.arrayBuffer()

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': resultBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('bg-remove route error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de l\'image.' },
      { status: 500 }
    )
  }
}
