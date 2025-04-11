"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import BlockchainDialog from "./blockchain-dialog";
import useBlockchainStore from "@/store/use-blockchain-store";

const NetworkButton = () => {
  const [open, setOpen] = React.useState(false);
  const { currentNetwork, currentBlockchain } = useBlockchainStore();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="relative md:h-12 md:w-12 h-10 w-10 hover:bg-default-100 dark:hover:bg-default-200 
        data-[state=open]:bg-default-100 dark:data-[state=open]:bg-default-200 
        hover:text-primary text-default-500 dark:text-default-800 rounded-full"
        onClick={() => setOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" fill="none" viewBox="0 0 24 24" className="cw--c-PJLV" data-id="chr-icon"><path fill="#292529" d="M10.722.69a2.69 2.69 0 012.556 0 2.689 2.689 0 001.616.303c.899-.114 1.795.233 2.383.923.364.427.853.73 1.397.865.88.219 1.59.866 1.89 1.722.185.53.531.989.99 1.312a2.689 2.689 0 011.14 2.288c-.02.561.138 1.114.45 1.58.502.755.59 1.712.235 2.546a2.689 2.689 0 00-.152 1.637 2.689 2.689 0 01-.7 2.458 2.689 2.689 0 00-.732 1.471 2.689 2.689 0 01-1.54 2.04c-.51.234-.935.62-1.215 1.108a2.689 2.689 0 01-2.173 1.345c-.56.033-1.096.241-1.533.594-.704.57-1.65.747-2.512.47a2.689 2.689 0 00-1.644 0c-.863.277-1.808.1-2.513-.47a2.689 2.689 0 00-1.532-.594 2.689 2.689 0 01-2.173-1.345 2.689 2.689 0 00-1.215-1.108 2.689 2.689 0 01-1.54-2.04 2.69 2.69 0 00-.733-1.47 2.689 2.689 0 01-.7-2.46 2.689 2.689 0 00-.151-1.636 2.689 2.689 0 01.236-2.545c.311-.467.468-1.02.45-1.58a2.689 2.689 0 011.139-2.29c.459-.322.805-.78.99-1.31a2.689 2.689 0 011.89-1.723 2.689 2.689 0 001.397-.865A2.689 2.689 0 019.106.993 2.689 2.689 0 0010.722.69z"></path><path fill="#393939" fill-rule="evenodd" d="M12.023 22.523c5.788 0 10.48-4.692 10.48-10.48s-4.692-10.48-10.48-10.48c-5.789 0-10.481 4.692-10.481 10.48s4.692 10.48 10.48 10.48zm0 .196c5.896 0 10.676-4.78 10.676-10.676S17.919 1.367 12.022 1.367c-5.896 0-10.676 4.78-10.676 10.676s4.78 10.676 10.677 10.676z" clip-rule="evenodd"></path><path fill="#FFB0C2" d="M14.427 14.44a3.16 3.16 0 01-2.797 1.694 3.17 3.17 0 01-3.164-3.176 3.17 3.17 0 013.164-3.176 3.16 3.16 0 012.796 1.693h3.294c-.66-2.765-3.133-4.823-6.09-4.823-3.463 0-6.27 2.818-6.27 6.293 0 3.476 2.807 6.294 6.27 6.294 2.948 0 5.414-2.046 6.084-4.798h-3.287z"></path><path fill="#CC91F0" d="M16.586 9.108a3.156 3.156 0 001.159-2.448 3.152 3.152 0 00-3.146-3.158 3.152 3.152 0 00-3.145 3.158v.002l.175-.002c2.02 0 3.813.959 4.957 2.448z"></path><path fill="#CC66B8" d="M14.601 9.82c.754 0 1.446-.266 1.988-.71a6.236 6.236 0 00-5.133-2.445 3.15 3.15 0 003.146 3.155z"></path></svg>
      </Button>

      <div>
        <div className="text-xs text-default-600 hover:text-primary cursor-pointer" onClick={() => setOpen(true)}>
          Current Network:
        </div>
        <div className="text-sm font-medium text-default-800 capitalize" onClick={() => setOpen(true)}>
          {currentNetwork} | {currentBlockchain?.name || 'Not Selected'}
        </div>
      </div>

      <BlockchainDialog
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

export default NetworkButton;