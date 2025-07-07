"use client";

import React from "react";
import { toast } from "react-hot-toast";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import useBlockchainStore from "@/store/use-blockchain-store";

interface CpAddressProps {
  address: string;
  type: "evm" | "account" | "hash" | "blockchain";
  truncate?: boolean;
  explorerUrl?: string; // Base URL for the explorer
}

const CpAddress: React.FC<CpAddressProps> = ({
  address,
  type,
  truncate = true,
}) => {
  const { currentNetwork, currentBlockchain } = useBlockchainStore();
  const explorerUrl = `https://explorer.chromia.com/${currentNetwork}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const getTruncatedAddress = (addr: string) => {
    if (!truncate || addr.length <= 10) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  };

  const getExplorerLink = () => {
    switch (type) {
      case "blockchain":
        return `${explorerUrl}/${address}`;
      case "evm":
        return `${explorerUrl}/${currentBlockchain?.rid}/address/${address}`;
      case "account":
        return `${explorerUrl}/${currentBlockchain?.rid}/account/${address}`;
      case "hash":
        return `${explorerUrl}/${currentBlockchain?.rid}/transaction/${address}`;
      default:
        return "#";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono">{getTruncatedAddress(address)}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="p-0 h-auto w-auto"
        title="Copy Address"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <a
        href={getExplorerLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0 h-auto w-auto inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        title="Open in Explorer"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
};

export default CpAddress;
