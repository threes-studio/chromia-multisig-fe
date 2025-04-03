"use client";
import * as React from "react";
import { toast } from "react-hot-toast";
import useChromia from "@/hooks/use-chromia";
import { ChevronDown, ChevronRight, ChevronUp, CheckCircle2, XCircle, HelpCircle, Timer } from 'lucide-react';
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Transaction, } from "@/config/api/transactions/types";
import { Account as AccountType } from "@/config/api/accounts/types";
import { signTransaction as signTransactionApi, executeTransaction } from '@/config/api/transactions/routes';
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import TransactionDetail from "./transaction-detail";
import { TransactionTableFilter } from "./transaction-table-filter";
import CreateTransaction from './create-transaction';
import CpStatus from "@/components/cp-status";
import { useAccount } from "wagmi";

export const statuses = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Ready",
    value: "ready",
  },
  {
    label: "Completed",
    value: "completed",
  },
]

export function TransactionTable({
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading,
  onSearchChange,
  onFilterChange,
  reloadData, // Add reloadData prop
}: {
  data: Transaction[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading: boolean;
  onSearchChange: (search: string) => void;
  onFilterChange: (status: string | undefined) => void;
  reloadData: () => void; // Add reloadData type
}) {
  const { signCreateMultisigAccount, signTransferAssetTx, signUpdateAuthDescriptorAccount, error } = useChromia();
  const [isSigning, setIsSigning] = React.useState(false); // Handle isSigning locally
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [collapsedRows, setCollapsedRows] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const { address: userAddress } = useAccount();

  const toggleRow = (id: string) => {
    if (collapsedRows.includes(id)) {
      setCollapsedRows(collapsedRows.filter((rowId) => rowId !== id));
      setSelectedTransaction(null);
    } else {
      setCollapsedRows([...collapsedRows, id]);
      const transaction = data.find((tx) => tx.id === id);
      setSelectedTransaction(transaction || null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleFilterChange = (status: string | undefined) => {
    onFilterChange(status);
  };

  const handleConfirm = async (transaction: Transaction) => {
    setIsSigning(true); // Set isSigning to true when signing starts
    try {
      if (!userAddress) return;

      let signature;
      if (transaction.type === 'register') {
        signature = await signCreateMultisigAccount(
          transaction.signers.map(s => s.pubKey),
          transaction.multiSigAccount?.signaturesRequired || 1,
        );
      }

      if (transaction.type === 'transferFund') {
        signature = await signTransferAssetTx(
          Buffer.from(transaction.accountId, 'hex'),
          Buffer.from(transaction.assetId, 'hex'),
          Buffer.from(transaction.recipient as string, 'hex'),
          {
            value: BigInt(Math.floor(Number(transaction.amount) * 10 ** 18)),
            decimals: 18,
          } as any,
        );
      }

      if (transaction.type === 'updateDescriptor') {
        signature = await signUpdateAuthDescriptorAccount(
          transaction.signersToUpdate.map(s => s.pubKey),
          transaction.signaturesRequiredToUpdate,
          Buffer.from(transaction.accountId, 'hex'),
          Buffer.from(transaction.authDescriptorId, 'hex'),
        );
      }

      if (!signature) {
        toast.error("Failed to sign the transaction.");
        return;
      }

      const encodeSig = {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex'),
        v: signature.v,
      };

      const result = await signTransactionApi(transaction.id, {
        signature: encodeSig,
        userAddress,
      });

      if (result.status === 'waiting') {
        toast.error("Failed to execute the transaction.");
      } else {
        toast.success(`Transaction signed successfully.`);
      }
      reloadData();
    } catch (err) {
      console.error("Failed to sign the transaction:", err);
      toast.error(error || "Failed to confirm the transaction.");
    } finally {
      setIsSigning(false); // Reset isSigning to false after signing is complete
    }
  };

  const handleExecute = async (transaction: Transaction) => {
    setIsSigning(true); // Set isSigning to true when execution starts
    try {
      if (!userAddress) return;

      const result = await executeTransaction(transaction.id, {
        userAddress,
      });

      if (result.status === 'waiting') {
        toast.error("Failed to execute the transaction.");
      } else {
        toast.success(`Transaction executed successfully.`);
      }

      reloadData();
    } catch (err) {
      toast.error(error || "Failed to confirm the transaction.");
    } finally {
      setIsSigning(false); // Reset isSigning to false after execution is complete
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="font-medium text-card-foreground/80">
            <div className="flex space-x-4 rtl:space-x-reverse items-center">
              <Button
                onClick={() => toggleRow(row.id)}
                size="icon"
                variant="outline"
                color="secondary"
                className="h-7 w-7 border-none rounded-full mr-4 transition-transform duration-300"
              >
                <Icon
                  icon="heroicons:chevron-down"
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    {
                      "rotate-180": collapsedRows.includes(row.id),
                    }
                  )}
                />
              </Button>
              {tx.type === "register" && "Register Multisig Account"}
              {tx.type === "transferFund" && "Transfer Funds"}
              {tx.type === "updateDescriptor" && "Update Auth Descriptor"}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "amount",
      header: 'Amount',
      cell: ({ row }) => {
        const tx = row.original;
        return <div className="whitespace-nowrap text-lg">{tx.amount ? `-${tx.amount} ${tx.assetSymbol}` : ''}</div>;
      },
    },
    {
      accessorKey: "signers",
      header: 'Signers',
      cell: ({ row }) => {
        const tx = row.original;
        const isComplete = tx.signatures.length === tx.signaturesRequired;
        const badgeColor = isComplete ? "success" : "secondary";
        const IconComponent = isComplete ? Check : Users;

        return (
          <Badge color={badgeColor}>
            <IconComponent className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
            {tx.signatures.length} out of {tx.signaturesRequired}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <CpStatus status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Date</div>,
      cell: ({ row }) => {
        const createdAt = new Date(row.getValue("createdAt"));
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

        let formatted = "";
        if (diffInSeconds < 60) {
          formatted = `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
          formatted = `${Math.floor(diffInSeconds / 60)} minutes ago`;
        } else if (diffInSeconds < 86400) {
          formatted = `${Math.floor(diffInSeconds / 3600)} hours ago`;
        } else {
          formatted = `${Math.floor(diffInSeconds / 86400)} days ago`;
        }

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tx = row.original;
        const isSigned = tx.signatures.some((s) => s.pubKey === userAddress);
        return (
          <div className="text-end">
            {tx.status === "pending" ? (
              <>
                <Button
                  onClick={() => handleConfirm(tx)}
                  disabled={isSigning || isSigned}
                  className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
                >
                  {isSigned ? "Signed" : isSigning ? "Signing..." : "Confirm"}
                </Button>
                {!isSigned && (
                  <Button
                    className="p-0 h-auto hover:bg-transparent bg-transparent text-destructive hover:text-destructive/80 hover:underline ml-2"
                  >
                    Reject
                  </Button>
                )}
              </>
            ) : tx.status === "ready" ? (
              <Button
                onClick={() => handleExecute(tx)}
                disabled={isSigning}
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
              >
                {isSigning ? "Executing..." : "Execute"}
              </Button>
            ) : (
              <Button
                className="p-0 h-auto bg-transparent text-muted-foreground cursor-not-allowed"
                disabled
              >
                Confirm
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const statusColumn = table.getColumn("status");
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="flex items-center flex-wrap gap-2 px-4">
        {/* Search Input */}
        <Input
          placeholder="Search txRid..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm min-w-[200px] h-10"
        />

        {/* Status Filter */}
        {statusColumn && (
          <TransactionTableFilter
            title="Status"
            options={statuses}
            onFilterChange={handleFilterChange}
          />
        )}

        <CreateTransaction reloadData={reloadData} />

      </div>
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              Loading Transactions...
            </h3>
          </div>
        ) : (
          <Table >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {collapsedRows.includes(row.id) && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <div className="w-full">
                            <TransactionDetail transaction={row.original} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-left" className="w-5 h-5 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8"
          >
            <Icon icon="heroicons:chevron-right" className="w-5 h-5 rtl:rotate-180" />
          </Button>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default TransactionTable;
