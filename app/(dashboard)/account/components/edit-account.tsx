"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import Select from "react-select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAccount } from "@/config/api/accounts";
import { type Account as AccountType } from "@/config/api";
import { Euro, Plus, Trash2, Upload } from "lucide-react";
import useChromia from "@/hooks/use-chromia";
import { useAccount } from 'wagmi';
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, { message: "Account name is required." }),
});

const styles = {
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: "14px",
  }),
};

interface Signer {
  id: string;
  name: string;
  pubKey: string;
}

const EditAccount = ({ open, onClose, account, reloadData }: {
  open: boolean,
  onClose: () => void,
  account: AccountType | null;
  reloadData: () => void;
}) => {
  const { address: userAddress } = useAccount();
  const [isSigning, setIsSigning] = React.useState(false);

  const [isPending, startTransition] = React.useTransition();
  const [signers, setSigners] = React.useState<Signer[]>(account?.signers || []);
  const [threshold, setThreshold] = React.useState<number>(account?.signaturesRequired || 1);
  const { signUpdateAuthDescriptorAccount, createUpdateAuthDescriptorTx } = useChromia();

  React.useEffect(() => {
    if (userAddress) {
      setSigners((prev) => {
        const updatedSigners = [...prev];
        return updatedSigners;
      });
    }
  }, [userAddress]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: account?.name || '' },
  });

  const addSigner = () => {
    setSigners((prev) => [...prev, { id: String(prev.length + 1), name: "", pubKey: "" }]);
    if (threshold && threshold > signers.length + 1) {
      setThreshold(signers.length + 1);
    }
  };

  const removeSigner = (id: string) => {
    if (signers.length > 2) {
      setSigners((prev) => prev.filter((signer) => signer.id !== id));
      if (threshold && threshold > signers.length - 1) {
        setThreshold(signers.length - 1);
      }
    } else {
      toast.error("At least two signer is required.");
    }
  };

  const onSubmit = (data: any) => {
    if (signers.length < 2) {
      toast.error("At least two signer is required.");
      return;
    }

    if (!userAddress) {
      toast.error("User address is required.");
      return;
    }

    setIsSigning(true);
    startTransition(async () => {
      try {
        if (!account || !account.mainDescriptor?.id) {
          return;
        }

        const hasChanges =
          JSON.stringify(signers.map(s => ({ pubKey: s.pubKey }))) !==
          JSON.stringify(account.signers.map(s => ({ pubKey: s.pubKey }))) ||
          threshold !== account.signaturesRequired;

        if (hasChanges) {
          const signature = await signUpdateAuthDescriptorAccount(
            signers.map(s => s.pubKey),
            threshold,
            Buffer.from(account.accountId, 'hex'),
            Buffer.from(account.mainDescriptor.id, 'hex'),
          );

          const encodeSig = {
            r: signature.r.toString('hex'),
            s: signature.s.toString('hex'),
            v: signature.v,
          };

          const tx = await createUpdateAuthDescriptorTx(
            [signature],
            signers.map(s => s.pubKey),
            threshold,
            Buffer.from(account.accountId, 'hex'),
            Buffer.from(account.mainDescriptor.id, 'hex'),
          );

          await updateAccount(account.id, {
            ...data,
            signers: signers.filter((s) => s.pubKey),
            signaturesRequired: threshold,
            tx,
            signature: encodeSig,
            userAddress,
          });
        } else {
          await updateAccount(account.id, {
            ...data,
            signers: signers.filter((s) => s.pubKey),
            signaturesRequired: threshold,
            userAddress,
          });
        }

        toast.success("Account updated successfully");
        reloadData();
        onClose();
      } catch (error) {
        console.error("Failed to update account:", error);
        toast.error("Failed to update account. Please try again.");
      } finally {
        setIsSigning(false);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="max-w-[736px] pt-5">
        <SheetHeader className="flex-row items-center justify-between mb-4">
          <span className="text-lg font-semibold text-default-900">Edit Account</span>
        </SheetHeader>
        <form className="h-full flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName" className="mb-1.5 text-default-600">Account Name</Label>
              <Input id="accountName" placeholder="Account Name" {...register("name", { required: true })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="threshold" className="mb-1.5 text-default-600">Threshold</Label>
              <Select
                isSearchable={false}
                className="react-select"
                classNamePrefix="select"
                options={Array.from({ length: signers.length }, (_, i) => ({
                  value: i + 1,
                  label: i + 1,
                }))}
                styles={styles}
                onChange={(selectedOption: any) => setThreshold(selectedOption?.value || 1)}
                value={threshold ? { value: threshold, label: threshold } : { value: 1, label: 1 }}
              />
              {!threshold && <p className="text-red-500 text-sm">Threshold is required.</p>}
            </div>

            <div className="border-t border-default-200 my-4"></div>
            <p className="text-xs text-default-400 dark:text-default-600 mb-4">
              Signers have full control over the account, they can
              <span className="text-primary italic"> propose, sign and execute</span> transactions.
            </p>

            {signers.map((signer, index) => (
              <div key={signer.id}>
                <Label htmlFor={`signerName-${signer.id}`} className="mb-1.5 text-default-600">
                  Signer #{index + 1}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`signerName-${signer.id}`}
                    placeholder="Enter signer name"
                    className="w-full"
                    value={signer.name}
                    onChange={(e) =>
                      setSigners((prev) =>
                        prev.map((s) =>
                          s.id === signer.id ? { ...s, name: e.target.value } : s
                        )
                      )
                    }
                  />
                  <Input
                    id={`signerPublicKey-${signer.id}`}
                    placeholder="Enter signer public key"
                    className="w-full"
                    value={signer.pubKey}
                    onChange={(e) =>
                      setSigners((prev) =>
                        prev.map((s) =>
                          s.id === signer.id ? { ...s, pubKey: e.target.value } : s
                        )
                      )
                    }
                  />
                  <Trash2
                    className={cn("w-4 h-4 cursor-pointer", {
                      "text-warning": index >= 1,
                      "text-gray-400 cursor-not-allowed": index < 2,
                    })}
                    onClick={() => index >= 2 && removeSigner(signer.id)}
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-start mt-2">
              <Button
                className="p-0 h-auto text-sm hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
                type="button"
                onClick={addSigner}
              >
                Add signer
              </Button>
            </div>
          </div>
          <SheetFooter className="pb-10">
            <SheetClose asChild>
              <Button type="button" color="warning" onClick={onClose}>Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={isSigning}>
              {isSigning ? "Processing..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditAccount;
