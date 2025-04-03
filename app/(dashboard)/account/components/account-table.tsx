"use client";
import * as React from "react";
import { toast } from "react-hot-toast";
import useChromia from "@/hooks/use-chromia";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";

import {
  registerAccount,
} from "@/config/api";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import CpAddress from '@/components/cp-address';
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import CpSignerAvatarList from "@/components/cp-signer-avatar-list";
import { Account as AccountType, transferFee } from '@/config/api'
import { useAccount } from "wagmi";
import { Menu } from "lucide-react";

const statusColors: { [key: string]: any } = {
  pending: "secondary",
  ready: "success",
  created: "warning",
  transferFee: "info",
};

const AccountTable = ({
  data,
  total,
  page,
  limit,
  onPageChange,
  onSortChange,
  onSearchChange,
  handleEditSheetOpen,
  handleSidebar,
  reloadData,
}: {
  data: AccountType[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSortChange: (field: string, direction: "asc" | "desc") => void;
  onSearchChange: (value: string) => void;
  handleEditSheetOpen: (account: AccountType) => void;
  handleSidebar: () => void;
  reloadData: () => void;
}) => {
  const { address: userAddress } = useAccount();
  const { signCreateMultisigAccount, createRegisterAccountTx, transferFeeToAccount } = useChromia();
  const isDesktop = useMediaQuery("(max-width: 1280px)");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchValue, setSearchValue] = React.useState<string>("");

  const handleTransferFee = async ({ id, accountId }: { id: string, accountId: string }) => {
    setLoadingId(id);
    try {
      const isSent = await transferFeeToAccount(accountId, 2);
      if (isSent) {
        await transferFee(id);
        toast.success("Transfer fee successful");
      } else {
        toast.success("Transaction is being processed");
      }
      reloadData();
    } catch (error) {
      toast.error((error as Error).message || "Failed to transfer fee");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRegister = async (account: AccountType) => {
    if (!userAddress) return;

    setLoadingId(account.id);
    try {
      const authorSignature = await signCreateMultisigAccount(
        account.signers.map(s => s.pubKey),
        account.signaturesRequired,
      );

      const tx = await createRegisterAccountTx(
        [authorSignature],
        account.signers.map(s => s.pubKey),
        account.signaturesRequired,
      );

      const encodeSig = {
        r: authorSignature.r.toString('hex'),
        s: authorSignature.s.toString('hex'),
        v: authorSignature.v,
      };
      await registerAccount(account.id, {
        tx,
        signature: encodeSig,
        userAddress,
      });
      toast.success("Signed successful");
      reloadData();
    } catch (error) {
      toast.error("Failed to register account");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSortChange = (field: string, direction?: "asc" | "desc") => {
    const sortDirection = direction || (sorting.find((s) => s.id === field)?.desc ? "asc" : "desc");
    setSorting([{ id: field, desc: sortDirection === "desc" }]);
    onSortChange(field, sortDirection);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const columns: ColumnDef<AccountType, any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleSortChange("name")}
        >
          Account Name
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "accountId",
      header: "Account Id",
      cell: ({ row }) => (
        <div>
          <CpAddress address={row.getValue("accountId")} type="chromia" />
        </div>
      ),
    },
    {
      accessorKey: "signers",
      header: "Signers",
      cell: ({ row }) => (
        <div>
          <CpSignerAvatarList signers={row.getValue("signers")} />
        </div>
      ),
    },
    {
      accessorKey: "signaturesRequired",
      header: "Threshold",
      cell: ({ row }) => (
        <div>
          <strong>{row.getValue("signaturesRequired")}</strong> out of{" "}
          <strong>{(row.getValue("signers") as AccountType["signers"])?.length}</strong> signers.
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          color={statusColors[row.getValue("status") as string] || ""}
          className="capitalize"
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div
          className="cursor-pointer"
          onClick={() => handleSortChange("createdAt")}
        >
          Created Date
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-default-600 whitespace-nowrap">
          {new Date(row.getValue("createdAt")).toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <div className="flex justify-center items-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status");
        const account = row.original;
        const accountId = account.id;
        return (
          <div className="flex justify-center items-center gap-2">
            {status === "pending" && (
              <Button
                onClick={() => handleTransferFee(account)}
                disabled={loadingId === account.id}
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
              >
                {loadingId === account.id ? "Processing..." : "Transfer Fee"}
              </Button>
            )}
            {status === "transferFee" && (
              <Button
                onClick={() => handleRegister(account)}
                disabled={loadingId === accountId}
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
              >
                {loadingId === accountId ? "Processing..." : "Register"}
              </Button>
            )}
            {status === "created" && (
              <Button
                onClick={() => handleEditSheetOpen(account)}
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
              >
                Edit
              </Button>
            )}
            {status === "registering" && (
              <Button
                className="p-0 h-auto hover:bg-transparent bg-transparent text-primary hover:text-primary/80 hover:underline"
                disabled={true}
              >
                Edit
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

  return (
    <div className="w-full flex flex-col h-full">
      <CardHeader className="flex-none p-3 sm:p-6 flex-row flex-wrap mb-0">
        <div className="flex-1 flex items-center gap-3 md:gap-4">
          {isDesktop && (
            <Menu
              className=" h-5 w-5 cursor-pointer text-default-600 "
              onClick={handleSidebar}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-default-300 text-default-500"
                onClick={() => {
                  handleSortChange("createdAt");
                  reloadData();
                }}
              >
                Sort <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleSortChange("createdAt", "asc")}>Asc</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("createdAt", "desc")}>Desc</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full md:w-fit md:flex-none">
          <div className="relative">
            <Search className="w-4 h-4 text-default-400 absolute top-1/2 ltr:left-2 rtl:right-2 -translate-y-1/2" />
            <Input
              placeholder="Search Accounts"
              className="ltr:pl-7 rtl:pr-7 h-10"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup, index) => (
                <TableRow key={`task-headerGroup-${index}`}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={`task-header-${index}`}
                        className="text-sm text-default-800 border-r border-default-200 last:text-center rtl:text-right rtl:first:pr-5"
                      >
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
            <TableBody className="[&_tr:last-child]:border-1">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={`task-bodyGroup-${index}`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={`task-bodyGroup-${index}`}
                        className="border-r border-default-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
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
        </div>
      </CardContent>
      <CardFooter className="flex-none mt-4">
        <div className="flex items-center gap-4 flex-wrap w-full">
          <div className="flex-1 text-sm whitespace-nowrap text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </div>

          <div className="flex-none flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8"
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4 rtl:rotate-180" />
            </Button>
            <ul className="flex gap-3 items-center">
              {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((p) => (
                <li key={`pagination-${p}`}>
                  <Button
                    onClick={() => onPageChange(p)}
                    variant={p === page ? "soft" : "outline"}
                    className={`w-8 h-8 ${p === page ? "text-white" : ""}`}
                  >
                    {p}
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="w-8 h-8 rtl:rotate-180"
            >
              <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </div>
  );
};

export default AccountTable;
