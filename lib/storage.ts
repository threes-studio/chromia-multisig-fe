import { createStorage } from 'wagmi'

export const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
}) 