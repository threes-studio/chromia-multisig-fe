"use client";

import * as React from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import CpAddress from "@/components/cp-address";
import useBlockchainStore from "@/store/use-blockchain-store";
import type { Blockchain } from "@/store/use-blockchain-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { useChainId, useSwitchChain } from 'wagmi'
import { getBlockchains } from "@/config/api/blockchains/routes";

interface BlockchainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlockchainDialog: React.FC<BlockchainDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { switchChain } = useSwitchChain();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedNetwork, setSelectedNetwork] = React.useState<'mainnet' | 'testnet'>('testnet');
  const [selectedBlockchain, setSelectedBlockchain] = React.useState<Blockchain | null>(null);
  const [localBlockchains, setLocalBlockchains] = React.useState<Blockchain[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    currentNetwork,
    currentBlockchain,
    setCurrentNetwork,
    setCurrentBlockchain,
    setBlockchains,
  } = useBlockchainStore();

  const fetchBlockchains = async (network: 'mainnet' | 'testnet') => {
    try {
      setIsLoading(true);
      const response = await getBlockchains({
        limit: 100,
        filter: 'network',
        network: network,
      });
      setLocalBlockchains(response.data);
    } catch (error) {
      console.error('Failed to fetch blockchains:', error);
      toast.error("Failed to fetch blockchains");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      setSelectedNetwork(currentNetwork);
      setSelectedBlockchain(currentBlockchain);
      fetchBlockchains(currentNetwork);
    }
  }, [open, currentNetwork, currentBlockchain]);

  const handleNetworkChange = async (network: 'mainnet' | 'testnet') => {
    try {
      setSelectedNetwork(network);
      setSelectedBlockchain(null);
      fetchBlockchains(network);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  const filteredBlockchains = React.useMemo(() => {
    if (!searchQuery) return localBlockchains;
    const query = searchQuery.toLowerCase();
    return localBlockchains.filter(
      blockchain =>
        blockchain.name.toLowerCase().includes(query) ||
        blockchain.rid.toLowerCase().includes(query)
    );
  }, [localBlockchains, searchQuery]);

  const handleBlockchainSelect = (blockchain: Blockchain) => {
    setSelectedBlockchain(blockchain);
  };

  const handleApplyChanges = async () => {
    try {
      const targetChainId = selectedNetwork === 'mainnet' ? 56 : 97;
      await switchChain({ chainId: targetChainId });
      setCurrentNetwork(selectedNetwork);
      setCurrentBlockchain(selectedBlockchain);
      setBlockchains(localBlockchains);
      onOpenChange(false);
      toast.success("Changes applied successfully");
    } catch (error) {
      console.error('Failed to switch chain:', error);
      toast.error("Changes failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 z-[999]">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-xl font-semibold">Select Blockchain</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto mr-4">
                  {selectedNetwork === 'testnet' ? 'Testnet' : 'Mainnet'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="p-2">
                <DropdownMenuItem
                  onClick={() => handleNetworkChange('testnet')}
                  className={cn(
                    "p-2 font-medium text-sm text-default-600 cursor-pointer mb-[2px]",
                    {
                      "bg-primary text-primary-foreground": selectedNetwork === "testnet",
                    }
                  )}
                >
                  <span className="mr-2">Testnet</span>
                  <Check
                    className={cn("w-4 h-4 flex-none ml-auto", {
                      hidden: selectedNetwork !== "testnet",
                    })}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNetworkChange('mainnet')}
                  className={cn(
                    "p-2 font-medium text-sm text-default-600 hover:bg-primary hover:text-primary-foreground dark:hover:bg-background cursor-pointer mb-[2px]",
                    {
                      "bg-primary text-primary-foreground": selectedNetwork === "mainnet",
                    }
                  )}
                >
                  <span className="mr-2">Mainnet</span>
                  <Check
                    className={cn("w-4 h-4 flex-none ml-auto text-default-700", {
                      hidden: selectedNetwork !== "mainnet",
                    })}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blockchains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-muted/40"
            />
          </div>
        </DialogHeader>
        <div className="p-2 max-h-[400px] overflow-y-auto overflow-x-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBlockchains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No blockchains found" : "No blockchains available"}
            </div>
          ) : (
            <div className="grid gap-1">
              {filteredBlockchains.filter((blockchain) => blockchain.network === selectedNetwork).map((blockchain) => (
                <Button
                  key={blockchain.rid}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-3 h-auto hover:bg-accent/50 rounded-lg transition-colors hover:text-default-900",
                    selectedBlockchain?.rid === blockchain.rid && "bg-accent"
                  )}
                  onClick={() => handleBlockchainSelect(blockchain)}
                >
                  <div className="flex items-center w-full gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserAvatar src={blockchain.rid} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium mb-0.5 truncate">{blockchain.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <CpAddress address={blockchain.rid} type="blockchain" truncate={true} />
                      </div>
                    </div>
                    {selectedBlockchain?.rid === blockchain.rid && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button onClick={handleApplyChanges} disabled={!selectedBlockchain}>
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockchainDialog;
