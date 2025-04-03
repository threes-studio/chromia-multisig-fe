"use client"
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import SummaryStats from "./summary-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Home
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryStats />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;