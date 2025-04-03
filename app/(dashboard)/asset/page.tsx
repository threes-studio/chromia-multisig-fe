"use client";

import Card from "@/components/ui/card-snippet";
import AssetTable from "./components/asset-table";

const TailwindUiTable = () => {
  return (
    <div className=" space-y-6">
      <Card title="Assets">
        <AssetTable />
      </Card>
    </div>
  );
};

export default TailwindUiTable;
