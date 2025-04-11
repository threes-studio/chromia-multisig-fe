import { useEffect, useState } from "react";
import { getAccounts, listAsset } from "@/config/api/accounts/routes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { useAccount } from "wagmi"; // Import useAccount
import useBlockchainStore from "@/store/use-blockchain-store";

const AssetTable = () => {
  const { address } = useAccount(); // Get EVM address
  const { currentBlockchain } = useBlockchainStore();
  const [accounts, setAccounts] = useState<{ id: string; name: string; accountId: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string } | null>(null);
  const [assets, setAssets] = useState<{ symbol: string; name: string; amount: string; iconUrl: string }[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [assetCache, setAssetCache] = useState<Record<string, any>>({}); // Cache for assets
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!address) return;
      try {
        const data = await getAccounts({
          filter: "signers.pubKey,blockchainRid",
          "signers.pubKey": address,
          blockchainRid: currentBlockchain?.rid,
          status: "created",
          limit: 100,
        });
        const accountsData = data.data || [];
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0]);
          await fetchAssets(accountsData[0].id);
        } else {
          setSelectedAccount(null);
          setAssets([]);
          setIsEmpty(true);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };

    fetchAccounts();
  }, [address, currentBlockchain?.rid]);

  const fetchAssets = async (accountId: string) => {
    if (assetCache[accountId]) {
      setAssets(assetCache[accountId]);
      setIsEmpty(assetCache[accountId].length === 0);
    } else {
      try {
        setIsLoading(true); // Set loading to true
        const data = await listAsset(accountId);
        setAssets(data || []);
        setAssetCache((prevCache) => ({ ...prevCache, [accountId]: data || [] }));
        setIsEmpty((data || []).length === 0);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    }
  };

  const handleAccountSelect = async (account: { id: string; name: string }) => {
    setSelectedAccount(account);
    await fetchAssets(account.id);
  };

  const columns: { key: string, label: string }[] = [
    {
      key: "name",
      label: "Name"
    },
    {
      key: "symbol",
      label: "Symbol"
    },
    {
      key: "amount",
      label: "Amount"
    },
    {
      key: "action",
      label: "Action"
    },
  ];

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-default-300 text-default-500"
          >
            {selectedAccount ? selectedAccount.name : "My Accounts"} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {accounts.map((account, index) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className="flex items-center gap-2"
            >
              <span className="font-medium">{account.name}</span>
              <span className="text-sm text-muted-foreground">
                {truncateAddress(account.accountId)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center mt-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-medium">Loading assets, please wait...</p>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center mt-10 text-center text-gray-500 h-full">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-400">💰</span>
          </div>
          <p className="mt-4 text-lg font-medium">No assets yet</p>
          <p className="text-sm text-gray-400">Your selected account has no assets available.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((item) => (
              <TableRow key={item.symbol}>
                <TableCell className="font-medium text-card-foreground/80">
                  <div className="flex gap-3 items-center">
                    <Avatar className="rounded-full">
                      <AvatarImage src={item.iconUrl} />
                      <AvatarFallback>{item.symbol}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-card-foreground">
                      {item.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.symbol}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell className="ltr:pr-5 rtl:pl-5">
                  <Button
                    className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
                    onClick={() => {
                      window.location.href = `/transaction?accountId=${selectedAccount?.id}&assetSymbol=${item.symbol}`;
                    }}
                    disabled={!address} // Disable if address is not found
                  >
                    Send
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AssetTable;
