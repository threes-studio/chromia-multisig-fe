"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { Trash2 } from "lucide-react";
import Select from "react-select";
import { z } from "zod";
import { cn } from "@/lib/utils"; // Ensure this path points to your utility function
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccount } from '@/config/api/accounts'; // Import the API function
import { useAccount } from "wagmi";
import useBlockchainStore from "@/store/use-blockchain-store";

const schema = z.object({
  name: z.string().min(2, { message: "Account name is required 2." }),
});

const styles = {
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: "14px",
  }),
};
const CreateAccount = ({ open, onClose, reloadData }: {
  open: boolean,
  onClose: () => void,
  reloadData: () => void
}) => {
  const { currentNetwork, currentBlockchain } = useBlockchainStore();
  const { address: userAddress } = useAccount();
  const [isSigning, setIsSigning] = React.useState(false); // Add isSigning state
  const [isPending, startTransition] = React.useTransition();
  const signerListDefault = [
    {
      "id": 1,
      "name": "Signer 1",
      "pubKey": userAddress,
    },
    {
      "id": 2,
      "name": "Signer 2",
      "pubKey": ""
    },
  ];
  const [signers, setSigners] = React.useState(signerListDefault);
  const [threshold, setThreshold] = React.useState<number>(1);

  React.useEffect(() => {
    if (userAddress) {
      setSigners((prev) => {
        const updatedSigners = [...prev];
        updatedSigners[0] = { ...updatedSigners[0], pubKey: userAddress };
        return updatedSigners;
      });
    }
  }, [userAddress]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const addSigner = () => {
    setSigners((prev) => [...prev, { id: prev.length + 1, name: "", pubKey: "" }]);
    if (threshold && threshold > signers.length + 1) {
      setThreshold(signers.length + 1);
    }
  };

  const removeSigner = (id: number) => {
    if (signers.length > 1) {
      setSigners((prev) => prev.filter((signer) => signer.id !== id));
      if (threshold && threshold > signers.length - 1) {
        setThreshold(signers.length - 1);
      }
    } else {
      toast.error("At least one signer is required.");
    }
  };

  const onSubmit = (data: any) => {
    if (signers.length < 1) {
      toast.error("At least one signer is required.");
      return;
    }

    if (!userAddress) {
      toast.error("User address is required.");
      return;
    }

    setIsSigning(true); // Start loading
    startTransition(async () => {
      try {
        await createAccount({
          ...data,
          signers: signers.filter(s => s.pubKey),
          signaturesRequired: threshold,
          userAddress,
          blockchainRid: currentBlockchain?.rid,
          network: currentNetwork,
        });
        toast.success("Successfully added");
        reloadData(); // Reload data after successful creation
      } catch (error) {
        console.error("Failed to create account:", error);
        toast.error("Failed to create account. Please try again.");
      } finally {
        setIsSigning(false); // Stop loading
      }
    });

    onClose();
    reset();
    setSigners(signerListDefault);
    setThreshold(1);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onClose}
    >
      <SheetContent className="max-w-[736px] pt-5">
        <SheetHeader className="flex-row items-center justify-between mb-4">
          <span className="text-lg font-semibold text-default-900">Create Account</span>
        </SheetHeader>
        <form className=" h-full flex flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="boardTitle" className="mb-1.5 text-default-600">Account Name</Label>
              <Input id="boardTitle" placeholder="Account Name" {...register("name", { required: true })} />
              {errors.name && <p className="text-red-500 text-sm">Account name is required.</p>}
            </div>
            <div>
              <Label
                htmlFor="priority"
                className="mb-1.5 text-default-600">
                Threshold
              </Label>
              <Select
                isSearchable={false}
                className="react-select"
                classNamePrefix="select"
                options={Array.from({ length: signers.length }, (_, i) => ({
                  value: i + 1,
                  label: i + 1,
                }))}
                styles={styles}
                onChange={(selectedOption) => setThreshold(selectedOption?.value || 1)}
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
                      "text-warning": index >= 2,
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
            <Button type="submit" disabled={!userAddress || isSigning}>
              {isSigning ? "Processing..." : "Create Account"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateAccount;

