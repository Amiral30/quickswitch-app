import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg
  
  ffmpeg = new FFmpeg()
  await ffmpeg.load()
  return ffmpeg
}

export const convertVideoToAudio = async (
  ffmpeg: FFmpeg,
  file: File,
  outputFormat: 'mp3' | 'wav' | 'ogg' = 'mp3'
): Promise<Blob> => {
  const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
  const outputName = `output.${outputFormat}`
  
  const fileData = await fetchFile(file)
  await ffmpeg.writeFile(inputName, fileData)
  await ffmpeg.exec(['-i', inputName, outputName])
  
  const data = await ffmpeg.readFile(outputName, 'binary')
  const uint8Array = typeof data === 'string' 
    ? new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
    : new Uint8Array(data)
  
  const blob = new Blob([uint8Array], { type: `audio/${outputFormat}` })
  
  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)
  
  return blob
}