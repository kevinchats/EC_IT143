"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cash flow" },
  { href: "/payments", label: "Money in" },
  { href: "/expenses", label: "Money out" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-4">
      <span className="mr-4 self-center text-lg font-semibold">
        Rental cash flow
      </span>
      {links.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
