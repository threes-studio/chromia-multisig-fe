"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

const statusFilters = [
  {
    label: "Pending",
    value: "pending",
    color: "destructive",
  },
  {
    label: "Transfer Fee",
    value: "transferFee",
    color: "warning",
  },
  {
    label: "Registering",
    value: "registering",
    color: "success",
  },
  {
    label: "Created",
    value: "created",
    color: "info",
  },
];

const AccountSidebar = ({
  onFilterChange,
  totalAccounts,
}: {
  onFilterChange: (status: string | null) => void;
  totalAccounts: number;
}) => {
  const accountFilters = [
    {
      icon: "heroicons:star",
      label: "Pinned",
      value: "Pinned",
    },
    {
      icon: "heroicons:document-text",
      label: `Accounts (${totalAccounts})`,
      value: "myaccount",
    },
  ];

  return (
    <>
      <ul>
        {accountFilters.map((item, index) => (
          <li
            key={`filter-key-${index}`}
            className={cn(
              "cursor-pointer flex items-center gap-1.5 p-3 rounded group hover:bg-primary/10"
            )}
          >
            <Icon
              icon={item.icon}
              className={cn(
                "w-4 h-4 text-default-600 group-hover:text-primary",
                ""
              )}
            />
            <span
              className={cn(
                "text-sm font-medium text-default-600 group-hover:text-primary",
                ""
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="border border-dashed mt-3 border-default-300"></div>
      <div className="mt-3 md:px-4 px-2">
        <div className="text-xs font-medium text-default-800 uppercase mb-2">
          Status
        </div>
        <ul className="mt-1 space-y-1.5">
          {statusFilters.map((item, index) => (
            <li
              key={`priority-item-${index}`}
              className="flex justify-between items-center gap-3 cursor-pointer"
              onClick={() => onFilterChange(item.value)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    `w-2 h-2 rounded-full block bg-${item.color} ring-2 ring-${item.color}`
                  )}
                ></span>
                <span className="text-sm font-medium text-default-600">
                  {item.label}
                </span>
              </div>
            </li>
          ))}
          <li
            className="flex justify-between gap-2 cursor-pointer"
            onClick={() => onFilterChange(null)} // Clear filter
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full block bg-white ring-2 ring-white"
                )}
              ></span>
              <span className="text-sm font-medium text-default-600 pl-1">
                Clear Filter
              </span>
            </div>
            <span className="text-sm font-medium text-default-600"></span>
          </li>
        </ul>
      </div>
      <div className="border border-dashed mt-5 border-default-300"></div>
    </>
  );
};

export default AccountSidebar;
