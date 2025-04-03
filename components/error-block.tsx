"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteLogoWithText } from "@/components/svg";

const ErrorBlock = () => {
  return (
    <div className="min-h-screen overflow-y-auto flex justify-center items-center p-10">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-[740px]">
          <SiteLogoWithText className="w-full h-auto" />
        </div>
        <div className="mt-16 text-center">
          <div className="text-2xl md:text-4xl lg:text-5xl font-semibold text-default-900">
            Ops! Page Not Found
          </div>
          <div className="mt-3 text-default-600 text-sm md:text-base">
            The page you are looking for might have been removed, <br /> had its
            name changed or is temporarily unavailable.
          </div>
          <Button asChild className="mt-9 md:min-w-[300px]" size="lg">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBlock;
