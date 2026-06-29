'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AviToMp4() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/convert/ffmpeg?from=avi&to=mp4')
  }, [router])

  return null
}