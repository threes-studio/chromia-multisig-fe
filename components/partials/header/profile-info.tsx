"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, UserAvatar } from "@/components/ui/avatar";
import { truncateAddress } from "@/lib/utils";
import { useAccount, useBalance, useDisconnect, useConnect } from "wagmi";
import { Icon } from "@iconify/react";
import useChromia from "@/hooks/use-chromia";
import CpDialogRegisterAccount from "@/components/cp-dialog-register-account";

const ProfileInfo = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { checkAccountChromiaExist, loginToChromia } = useChromia();
  const [accountExist, setAccountExist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleConnect = () => {
    connect({ connector: connectors[0] })
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleLoginChromia = async () => {
    setIsLoading(true);
    try {
      const exist = await checkAccountChromiaExist();
      setAccountExist(exist);

      if (exist) {
        await loginToChromia();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      handleLoginChromia()
    }
  }, [address]);

  const formattedBalance = balance
    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
    : "Loading...";

  if (!address) {
    return (
      <button
        onClick={() => handleConnect()}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
      >
        <Icon icon="logos:metamask-icon" className="w-5 h-5" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isLoading && !accountExist && address && (
        <div className="mr-2">
          <CpDialogRegisterAccount />
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-[36px] w-[36px]">
              <UserAvatar src={address || "default-avatar"} />
            </Avatar>
            <div>
              <div className="text-xs text-default-600 hover:text-primary cursor-pointer">
                {truncateAddress(address)}
              </div>
              <div className="text-sm font-medium text-default-800 capitalize">
                {formattedBalance}
              </div>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 p-0 mt-3" align="center">
          <DropdownMenuItem
            onSelect={handleDisconnect}
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
          >
            <Icon icon="heroicons:power" className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;
