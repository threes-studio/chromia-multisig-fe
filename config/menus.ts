
import {
  DashBoard,
  Diamond,
  Authentication,
  ListFill,
  Grid,
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[]
  nested?: MenuItemProps[]
  onClick: () => void;
}

export const menusConfig = {
  mainNav: [
    {
      title: "Menu",
      icon: Grid,
      child: [
        {
          title: "dashboard",
          icon: DashBoard,
          href: "/dashboard",
        },
        {
          title: "accounts",
          icon: Authentication,
          href: "/account",
        },
        {
          title: "assets",
          icon: Diamond,
          href: "/asset",
        },
        {
          title: "transactions",
          icon: ListFill,
          href: "/transaction",
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Menu",
        icon: Grid,
        child: [
          {
            title: "dashboard",
            icon: DashBoard,
            href: "/dashboard",
          },
          {
            title: "accounts",
            icon: Authentication,
            href: "/account",
          },
          {
            title: "assets",
            icon: Diamond,
            href: "/asset",
          },
          {
            title: "transactions",
            icon: ListFill,
            href: "/transaction",
          },
        ],
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "accounts",
        icon: Authentication,
        href: "/account",
      },
      {
        title: "assets",
        icon: Diamond,
        href: "/asset",
      },
      {
        title: "transactions",
        icon: ListFill,
        href: "/transaction",
      },
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]