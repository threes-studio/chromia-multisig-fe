import React from "react";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

interface CpStatusProps {
  status: "ready" | "completed" | "rejected" | "pending" | string;
  className?: string; // Optional className prop for customization
}

const CpStatus: React.FC<CpStatusProps> = ({ status, className }) => {
  const getColor = () => {
    switch (status) {
      case "ready":
        return "info";
      case "completed":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Badge
      variant="soft"
      color={getColor()}
      className={clsx("capitalize", className)} // Apply custom className
    >
      {status}
    </Badge>
  );
};

export default CpStatus;
