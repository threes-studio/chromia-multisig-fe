"use client";

import React, { useState, useEffect } from "react";
import AccountSidebar from "./account-sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AccountTable from "./account-table";
import { Button } from "@/components/ui/button";
import CreateAccount from "./create-account";
import EditAccount from "./edit-account";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { type Account as AccountType, getAccounts } from "@/config/api";
import { useAccount } from "wagmi"; // Import useAccount

const ViewAccount = () => {
  const { address } = useAccount(); // Get EVM address
  const [open, setOpen] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null); // Filter by status
  const isDesktop = useMediaQuery("(max-width: 1280px)");

  const fetchAccounts = async (page: number) => {
    if (!address) return; // Ensure address is available
    try {
      const response = await getAccounts({
        page,
        limit,
        sort: sortField,
        direction: sortDirection,
        search: "accountId,name",
        q: debouncedKeyword,
        filter: filterStatus ? "signers.pubKey,status" : "signers.pubKey",
        status: filterStatus || undefined,
        "signers.pubKey": address, // Add address to the filter
      });
      setAccounts(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts(page);
  }, [page, sortField, sortDirection, debouncedKeyword, filterStatus, address]);

  // Debounce effect for keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  const handleSheetOpen = () => {
    setOpen(!open);
  };

  const handleEditSheetOpen = (account: AccountType) => {
    setSelectedAccount(account);
    setOpenEdit(true);
  };

  const handleEditSheetClose = () => {
    setOpenEdit(false);
    setSelectedAccount(null);
    fetchAccounts(page); // Reload data after closing the edit sheet
  };

  const handleCreateAccountClose = () => {
    setOpen(false);
    fetchAccounts(page); // Reload data after closing the create sheet
  };

  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
    setPage(1); // Reset to the first page when applying a filter
  };

  return (
    <>
      <div className="flex flex-wrap mb-7">
        <div className="text-xl font-medium text-default-900 flex-1">Accounts</div>
      </div>

      <div className="app-height flex gap-6 relative overflow-hidden">
        {isDesktop && showSidebar && (
          <div
            className="bg-background/60 backdrop-filter backdrop-blur-sm absolute w-full flex-1 inset-0 z-[99] rounded-md"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}
        <div
          className={cn("transition-all duration-150 flex-none", {
            "absolute h-full top-0 md:w-[260px] w-[200px] z-[999]": isDesktop,
            "flex-none min-w-[260px]": !isDesktop,
            "left-0": isDesktop && showSidebar,
            "-left-full": isDesktop && !showSidebar,
          })}
        >
          <Card className="h-full overflow-y-auto no-scrollbar">
            <CardHeader className="sticky top-0 mb-0 bg-card z-50">
              <Button className="w-full" onClick={handleSheetOpen} disabled={!address}>
                + Add Account
              </Button>
            </CardHeader>
            <CardContent className="p-2 md:px-6">
              <AccountSidebar
                onFilterChange={handleFilterChange}
                totalAccounts={total} // Pass total accounts to sidebar
              />
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1 overflow-x-auto">
          <AccountTable
            data={accounts}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onSortChange={(field, direction) => {
              setSortField(field);
              setSortDirection(direction);
            }}
            onSearchChange={(value) => setKeyword(value)}
            handleEditSheetOpen={(account) => handleEditSheetOpen(account)}
            handleSidebar={() => setShowSidebar(true)}
            reloadData={() => fetchAccounts(page)}
          />
        </Card>
      </div>
      <CreateAccount open={open} onClose={handleCreateAccountClose} reloadData={() => fetchAccounts(page)} />
      {selectedAccount && (
        <EditAccount
          open={openEdit}
          onClose={handleEditSheetClose}
          account={selectedAccount}
          reloadData={() => fetchAccounts(page)}
        />
      )}
    </>
  );
};

export default ViewAccount;
