import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Blockchain {
  name: string;
  rid: string;
  network: string;
  feeId: string;
  feeValue: number;
  feeSymbol: string;
  feeDecimals: number;
}

interface BlockchainState {
  currentNetwork: 'mainnet' | 'testnet';
  currentBlockchain: Blockchain | null;
  blockchains: Blockchain[];
  setCurrentNetwork: (network: 'mainnet' | 'testnet') => void;
  setCurrentBlockchain: (blockchain: Blockchain | null) => void;
  setBlockchains: (blockchains: Blockchain[]) => void;
  clearBlockchains: () => void;
}

const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set) => ({
      currentNetwork: 'testnet',
      currentBlockchain: {
        name: 'Dex Cp1',
        rid: 'E592E9C2A048753CB39818B9926A1FD09F4BD02CD673648284356540BC9ADD4E',
        network: 'testnet',
        feeId: '254B2F0A736E74F25AB3D823D7D39208E8A550E08FC65DDE1C50FC4361C2D81A',
        feeSymbol: 'BUSC',
        feeValue: 2,
        feeDecimals: 18,
      },
      blockchains: [],

      setCurrentNetwork: (network) =>
        set({ currentNetwork: network }),

      setCurrentBlockchain: (blockchain) =>
        set({ currentBlockchain: blockchain }),

      setBlockchains: (blockchains) =>
        set({ blockchains }),

      clearBlockchains: () =>
        set({ blockchains: [], currentBlockchain: null }),
    }),
    {
      name: 'blockchain-storage',
    }
  )
);

export default useBlockchainStore; 