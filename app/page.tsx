import React from "react";
import HomePage from "@/app/(dashboard)/home/page";
import { redirect } from "next/navigation";

const page = () => {
  return <HomePage />;
  // redirect("/");
};

export default page;
