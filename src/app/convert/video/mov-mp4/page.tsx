'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MovToMp4() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/convert/ffmpeg?from=mov&to=mp4')
  }, [router])

  return null
}