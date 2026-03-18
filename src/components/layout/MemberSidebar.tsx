"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/members", label: "Dashboard", icon: "🏠" },
  { href: "/members/videos", label: "Videos", icon: "🎥" },
  { href: "/members/schedule", label: "Schedule", icon: "📅" },
  { href: "/members/progress", label: "Progress", icon: "🥋" },
  { href: "/members/attendance", label: "Attendance", icon: "✅" },
  { href: "/members/profile", label: "Profile", icon: "👤" },
];

export default function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-dark border-r border-brand-gray hidden lg:block">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Member Portal
        </h2>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/members"
                ? pathname === "/members"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  isActive
                    ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/30"
                    : "text-gray-300 hover:text-white hover:bg-brand-gray/50"
                )}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-brand-gray space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-brand-gray/50 transition"
          >
            <span>🏪</span>
            Back to Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/members/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-brand-gray/50 transition w-full"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
