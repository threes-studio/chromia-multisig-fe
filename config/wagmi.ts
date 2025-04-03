"use client";

import { http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { createConfig } from 'wagmi'
import { storage } from '@/lib/storage'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask()
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: storage,
  ssr: true
}) 