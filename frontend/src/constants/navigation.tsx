import { ReactNode } from "react";

export type AppRole = "admin" | "user";

export interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
}

const dashboardIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 5h8"
    />
  </svg>
);

const userIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"
    />
  </svg>
);

const strategiesIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const analyticsIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 19V9m4 10V5m-8 14V13m4 6V7M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const settingsIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);

const calendarIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const contentIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 8h10M7 12h7m-7 4h10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
    />
  </svg>
);

const profileIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const monitoringIcon = (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 13h4l3-8 4 16 3-8h4"
    />
  </svg>
);

export const userNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/user/dashboard", icon: dashboardIcon },
  { name: "My Strategies", href: "/user/strategies", icon: strategiesIcon },
  { name: "Content", href: "/user/content", icon: contentIcon },
  { name: "SWOT", href: "/user/swot", icon: analyticsIcon },
  { name: "AI Monitoring", href: "/user/ai-monitoring", icon: monitoringIcon },
  { name: "Calendar", href: "/calendar", icon: calendarIcon },
  { name: "Settings", href: "/user/settings", icon: settingsIcon },
];

export const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: dashboardIcon },
  { name: "Users", href: "/admin/users", icon: userIcon },
  { name: "Calendar", href: "/admin/calendar", icon: calendarIcon },
  { name: "Strategies", href: "/admin/strategies", icon: strategiesIcon },
  { name: "Content", href: "/admin/content", icon: contentIcon },
  {
    name: "SWOT Analytics",
    href: "/admin/swot-analytics",
    icon: analyticsIcon,
  },
  { name: "AI Monitoring", href: "/admin/ai-monitoring", icon: monitoringIcon },
  { name: "Settings", href: "/admin/settings", icon: settingsIcon },
];

export const getNavigationForRole = (role: AppRole): NavigationItem[] => {
  return role === "admin" ? adminNavigation : userNavigation;
};

export const getPageTitleFromPath = (
  pathname: string | null,
  role: AppRole,
): string => {
  if (!pathname) {
    return role === "admin" ? "Admin dashboard" : "Dashboard";
  }

  const navigation = getNavigationForRole(role)
    .slice()
    .sort((a, b) => b.href.length - a.href.length);

  const activeItem = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (activeItem) {
    return activeItem.name;
  }

  return role === "admin" ? "Admin dashboard" : "Dashboard";
};
