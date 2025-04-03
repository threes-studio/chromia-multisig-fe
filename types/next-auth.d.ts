import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      address: string;
      signature: string;
    } & DefaultSession["user"];
  }

  interface User {
    address: string;
    signature: string;
  }
} 