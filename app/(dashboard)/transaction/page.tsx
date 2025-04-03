"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TransactionTable from "./components/transaction-table";
import { getTransactions } from "@/config/api/transactions/routes";
import { Transaction } from "@/config/api/transactions/types";
import { useAccount } from "wagmi"; // Import useAccount

const DataTablePage = () => {
  const { address } = useAccount(); // Get EVM address
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchTransactions = async (searchQuery?: string, status?: string) => {
    if (!address) return; // Ensure address is available
    try {
      setIsTableLoading(true);
      const response = await getTransactions({
        page,
        limit: pageSize,
        search: "txRid,type",
        q: searchQuery,
        filter: status ? "signers.pubKey,status" : "signers.pubKey",
        status,
        "signers.pubKey": address, // Pass the EVM address to the API
        populate: 'multiSigAccount'
      });
      setTransactions(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setTimeout(() => {
        setIsTableLoading(false);
        setLoading(false);
      }, 500);
    }
  };

  const debounceFetchTransactions = useCallback(
    debounce((searchQuery: string, status?: string) => {
      fetchTransactions(searchQuery, status);
    }, 500),
    [page, pageSize, address]
  );

  useEffect(() => {
    debounceFetchTransactions(search, statusFilter);
  }, [search, statusFilter, page, pageSize, address]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-gray-100 p-4 rounded-full">
                <span className="text-4xl">💼</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                Loading Transactions...
              </h3>
              <p className="text-sm text-gray-500">
                Please wait while we fetch your data.
              </p>
            </div>
          ) : (
            <TransactionTable
              data={transactions}
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              isLoading={isTableLoading}
              onSearchChange={setSearch}
              onFilterChange={setStatusFilter}
              reloadData={() => fetchTransactions(search, statusFilter)} // Pass reloadData
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default DataTablePage;
