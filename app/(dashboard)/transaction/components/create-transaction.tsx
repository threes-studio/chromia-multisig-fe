"use client";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteLogo } from "@/components/svg";
import { toast } from "react-hot-toast";
import { getAccounts, listAsset } from "@/config/api/accounts/routes";
import { CreateTransaction as CreateTransactionType } from "@/config/api/transactions/types";
import { useForm, Controller } from "react-hook-form";
import useChromia from "@/hooks/use-chromia";
import { createTransaction } from "@/config/api/transactions/routes";
import { useAccount } from "wagmi";
import useBlockchainStore from "@/store/use-blockchain-store";

const types = [
  { value: "transferFund", label: "Transfer Fund" },
];

const styles = {
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: "14px",
  }),
};

export default function CreateTransaction({
  reloadData,
}: {
  reloadData: () => void;
}) {
  const [isSigning, setIsSigning] = useState(false); // Handle isSigning locally
  const [accounts, setAccounts] = useState<{ value: string; label: string, accountId: string, mainDescriptorId: string }[]>([]);
  const [assets, setAssets] = useState<{ value: string; label: string; amount: number, id: string }[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssetBalance, setSelectedAssetBalance] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { signTransferAssetTx, createTransferAssetTx } = useChromia();
  const { address: userAddress } = useAccount();
  const { currentBlockchain } = useBlockchainStore();

  const searchParams = useSearchParams();
  const accountIdFromParams = searchParams.get("accountId");
  const assetSymbolFromParams = searchParams.get("assetSymbol");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      account: null,
      type: types[0],
      recipient: "",
      asset: null,
      amount: "",
      note: "",
    },
  });

  const account: any = watch("account");
  const asset: any = watch("asset");

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userAddress) return;

      setLoadingAccounts(true);
      try {
        const response = await getAccounts({
          limit: 100,
          select: "id,name,accountId,mainDescriptor",
          filter: "status,signers.pubKey,blockchainRid",
          status: "created",
          'signers.pubKey': userAddress,
          blockchainRid: currentBlockchain?.rid,
        });
        const formattedAccounts = response.data.map((account: any) => ({
          value: account.id,
          label: account.name,
          accountId: account.accountId,
          mainDescriptorId: account?.mainDescriptor?.id,
        }));
        setAccounts(formattedAccounts);

        // Auto-select account if accountId is provided in URL params
        if (accountIdFromParams) {
          const matchingAccount = formattedAccounts.find(
            (acc: { value: string }) => acc.value === accountIdFromParams
          );
          if (matchingAccount) {
            setValue("account", matchingAccount);
            setIsDrawerOpen(true);
          }
        }
      } catch (error) {
        toast.error("Failed to load accounts.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [accountIdFromParams, userAddress, setValue, currentBlockchain?.rid]);

  useEffect(() => {
    if (!account) return;

    const fetchAssets = async () => {
      setLoadingAssets(true);
      try {
        const response = await listAsset(account.value);
        const formattedAssets = response.map((asset: any) => ({
          value: asset.symbol,
          label: asset.symbol,
          amount: asset.amount,
          decimals: asset.decimals,
          id: asset.id,
        }));
        setAssets(formattedAssets);

        // Auto-select asset if assetSymbol is provided in URL params
        if (assetSymbolFromParams) {
          const matchingAsset = formattedAssets.find(
            (asset: any) => asset.value === assetSymbolFromParams
          );
          if (matchingAsset) {
            setValue("asset", matchingAsset);
          }
        }
      } catch (error) {
        console.error("Failed to load assets:", error);
        toast.error("Failed to load assets.");
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [account, assetSymbolFromParams, setValue]);

  useEffect(() => {
    if (asset) {
      const selectedAsset = assets.find((a) => a.value === asset?.value);
      setSelectedAssetBalance(selectedAsset?.amount || null);
    } else {
      setSelectedAssetBalance(null);
    }
  }, [asset, assets]);

  const onSubmit = async (data: any) => {
    setIsSigning(true); // Set isSigning to true when submitting
    try {
      if (!userAddress) return;
      const selectedAsset = assets.find((a) => a.value === data.asset.value);

      if (!selectedAsset) {
        return;
      }
      if (data.recipient.toLowerCase() === data.account.accountId.toLowerCase()) {
        toast.error("Recipient cannot be the same as the account ID");
        return;
      }

      const payload: CreateTransactionType = {
        tx: '',
        signature: {
          r: '',
          s: '',
          v: 0
        },
        assetId: selectedAsset.id,
        type: data.type.value,
        multiSigAccount: data.account.value,
        recipient: data.recipient,
        amount: parseFloat(data.amount),
        assetSymbol: data.asset.value,
        assetDecimals: data.asset.decimals,
        note: data.note,
        userAddress,
      };

      const authorSignature = await signTransferAssetTx(
        Buffer.from(data.account.accountId, 'hex'),
        Buffer.from(selectedAsset.id, 'hex'),
        Buffer.from(data.recipient, 'hex'),
        {
          value: BigInt(Math.floor(parseFloat(data.amount) * 10 ** data.asset.decimals)),
          decimals: data.asset.decimals,
        } as any,
      );

      const tx = await createTransferAssetTx(
        [authorSignature],
        Buffer.from(selectedAsset.id, 'hex'),
        Buffer.from(data.recipient, 'hex'),
        {
          value: BigInt(Math.floor(parseFloat(data.amount) * 10 ** data.asset.decimals)),
          decimals: data.asset.decimals,
        } as any,
        Buffer.from(data.account.accountId, 'hex'),
      );

      const encodeSig = {
        r: authorSignature.r.toString('hex'),
        s: authorSignature.s.toString('hex'),
        v: authorSignature.v,
      };

      await createTransaction({
        ...payload,
        tx,
        signature: encodeSig,
      });

      toast.success("Transaction created successfully!");
      reloadData(); // Reload data after successful creation
      reset(); // Reset form data
      setIsDrawerOpen(false); // Close the drawer
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Failed to create transaction.");
    } finally {
      setIsSigning(false); // Reset isSigning to false after submission
    }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetTrigger asChild>
        <Button disabled={!userAddress}>
          <span className="text-xl mr-1">
            <Icon icon="icon-park-outline:plus" />
          </span>
          New Transaction
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-[736px] p-0">
        <SheetHeader className="py-3 pl-4">
          <SheetTitle>Create a New Transaction</SheetTitle>
        </SheetHeader>
        <hr />
        <div className="px-5 py-6 h-[calc(100vh-120px)]">
          <ScrollArea className="h-full">
            <div className="text-center py-2">
              <div className="flex justify-center">
                <Link href="#">
                  <SiteLogo className="w-12 h-12 mb-2 text-primary" />
                </Link>
              </div>
              <h3 className="text-2xl font-bold text-default-700">
                Create a new transaction
              </h3>
              <p className="text-default-600 mt-1">
                Fill in the details below to initiate a new transaction.
              </p>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="md:grid md:grid-cols-2 gap-6 mt-6 space-y-6 md:space-y-0 px-2">
                <div className="md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="types">Types</Label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          className="react-select"
                          classNamePrefix="select"
                          options={types}
                          styles={styles}
                        />
                      )}
                    />
                    {errors.type && (
                      <p className="text-red-500 text-sm">{errors.type.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="accounts">Accounts</Label>
                  <Controller
                    name="account"
                    control={control}
                    rules={{ required: "Account is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="react-select"
                        classNamePrefix="select"
                        options={accounts}
                        styles={styles}
                        isLoading={loadingAccounts}
                      />
                    )}
                  />
                  {errors.account && (
                    <p className="text-red-500 text-sm">{errors.account.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="assets">Assets</Label>
                  <Controller
                    name="asset"
                    control={control}
                    rules={{ required: "Asset is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="react-select"
                        classNamePrefix="select"
                        options={assets}
                        styles={styles}
                        isLoading={loadingAssets}
                        isDisabled={!account}
                      />
                    )}
                  />
                  {errors.asset && (
                    <p className="text-red-500 text-sm">{errors.asset.message}</p>
                  )}
                  {selectedAssetBalance !== null && (
                    <p className="mt-1 text-sm text-gray-500">
                      <strong>Balance:</strong> {selectedAssetBalance}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="recipient">Recipient Account Id</Label>
                    <Controller
                      name="recipient"
                      control={control}
                      rules={{ required: "Recipient is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Please enter recipient account ID"
                        />
                      )}
                    />
                    {errors.recipient && (
                      <p className="text-red-500 text-sm">{errors.recipient.message}</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Controller
                      name="amount"
                      control={control}
                      rules={{
                        required: "Amount is required",
                        validate: (value) => {
                          if (parseFloat(value) <= 0) {
                            return "Amount must be greater than 0";
                          }
                          if (selectedAssetBalance !== null && parseFloat(value) > selectedAssetBalance) {
                            return "Amount exceeds available balance";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="Please enter the amount"
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm">{errors.amount.message}</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="note">Note</Label>
                    <Controller
                      name="note"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Please enter your note"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <SheetFooter className="gap-3 pt-4 block">
                <div className="flex items-center gap-2.5 justify-center">
                  <SheetClose asChild>
                    <Button color="destructive" variant="outline" size="xs">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button size="xs" type="submit" disabled={isSigning}>
                    {isSigning ? "Creating..." : "Submit"}
                  </Button>
                </div>
              </SheetFooter>
            </form>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
