"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import useChromia from "@/hooks/use-chromia";
import { toast } from "react-hot-toast";
import { Copy, ExternalLink } from "lucide-react";

const CpDialogRegisterAccount = () => {
  const { getAccountIdForNewAccount, registerAccountToChromia } = useChromia();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    if (!accountId) return;

    navigator.clipboard.writeText(accountId);
    toast.success("Address copied to clipboard!");
  };

  const handleCreateAccount = async () => {
    if (!accountId) {
      toast.error("Account ID is missing!");
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);
    try {
      await registerAccountToChromia(accountId);
      toast.success("Account successfully registered!");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Failed to register account. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAccountId = async () => {
      const accountId = await getAccountIdForNewAccount();
      setAccountId(accountId.toString('hex'));
    };

    fetchAccountId();
  }, []);

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-4 ">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Register Account</Button>
        </DialogTrigger>
        <DialogContent size="lg" overlayClass=" bg-linear-to-b from-background/60 to-primary/30">
          <DialogHeader>
            <DialogTitle className="text-base font-medium ">
              Register Account
            </DialogTitle>
          </DialogHeader>

          <p className="my-6 text-sm font-medium text-default-700">
            To register, send a <span className="font-bold text-primary">2 USDC</span> registration fee to the account below. Once the transfer is successful, click the "Create Account" button to complete the process.
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={accountId ?? ""}
              readOnly
              className="bg-gray-100 text-primary font-medium"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="p-0 h-auto w-auto"
              title="Copy Address"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5">
            <Button
              type="button"
              onClick={handleCreateAccount}
              disabled={isLoading || isProcessing}
            >
              {isProcessing ? "Creating..." : isLoading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CpDialogRegisterAccount;