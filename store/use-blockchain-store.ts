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
        name: 'Economy chain',
        rid: '090BCD47149FBB66F02489372E88A454E7A5645ADDE82125D40DF1EF0C76F874',
        network: 'testnet',
        feeId: '9EF73A786A66F435B3B40E72F5E9D85A4B09815997E087C809913E1E7EC686B4',
        feeSymbol: 'tCHR',
        feeValue: 10,
        feeDecimals: 6,
        isActive: true,
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