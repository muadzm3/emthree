
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Explore", href: "/explore", icon: "⌕" },
  { label: "Bookmark", href: "/bookmarks", icon: "▤" },
  { label: "Temukan Penulis", href: "/authors", icon: "♙" },
  { label: "Profil", href: "/profile", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[72px] z-20 hidden h-[calc(100vh-72px)] w-60 flex-col border-r border-stone-200 bg-[#faf9f6] px-5 py-8 md:flex">
      <p className="mb-5 px-3 text-xs font-bold uppercase tracking-widest text-stone-400">
        Menu utama
      </p>

      <nav className="space-y-2 mb-6">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-emerald-50 font-semibold text-emerald-900"
                  : "dark:text-stone-300 dark:hover:bg-neutral-700"
              }`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </Link>
          );
        })}
      </nav>



      <div className="mt-auto rounded-2xl bg-emerald-900 p-5 text-white">
        <p className="font-semibold">Ruang untuk ceritamu.</p>
        <p className="mt-2 text-sm leading-6 text-emerald-100">
          Tidak harus sempurna. Yang penting, mulai menulis.
        </p>
      </div>
    </aside>
  );
}
