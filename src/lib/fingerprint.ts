import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fpPromise: ReturnType<typeof FingerprintJS.load> | null = null

export const getFingerprint = async (): Promise<string> => {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load()
  }
  const fp = await fpPromise
  const result = await fp.get()
  return result.visitorId
}

export const getUsageCount = (): number => {
  if (typeof localStorage === 'undefined') return 0
  const today = new Date().toDateString()
  const stored = localStorage.getItem(`usage_${today}`)
  return stored ? parseInt(stored, 10) : 0
}

export const incrementUsage = (): number => {
  const today = new Date().toDateString()
  const count = getUsageCount() + 1
  localStorage.setItem(`usage_${today}`, count.toString())
  return count
}

export const canUseFree = (): boolean => {
  return getUsageCount() < 10
}