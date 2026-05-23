"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "คิดถึงนะ", icon: "💌" },
  { href: "/history", label: "ประวัติ", icon: "📊" },
  { href: "/quiz", label: "เกมตอบคำถาม", icon: "🎮" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center px-4 py-1 rounded-xl transition-all ${
                active ? "text-pink-500" : "text-gray-400"
              }`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className={`text-xs mt-0.5 font-medium ${active ? "text-pink-500" : "text-gray-400"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
