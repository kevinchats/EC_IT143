"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/payments", label: "Transactions" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[var(--card-border)] pb-4">
      <span className="mr-4 self-center text-lg font-semibold text-[var(--foreground)]">
        Business tracker
      </span>
      {links.map((l) => {
        const active =
          l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "nav-link nav-link-active" : "nav-link"}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
