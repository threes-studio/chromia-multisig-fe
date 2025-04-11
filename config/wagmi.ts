"use client";

import { http } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { createConfig } from 'wagmi'
import { storage } from '@/lib/storage'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    metaMask()
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  storage: storage,
  ssr: true
}) 