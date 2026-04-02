"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Megaphone,
  List,
  PlusCircle,
  ChevronDown,
  LogOut,
  MoreVertical,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [campaignsOpen, setCampaignsOpen] = useState(
    pathname.startsWith("/campaigns"),
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isCampaignActive = pathname.startsWith("/campaigns");

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-[var(--color-primary)] text-white"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
    }`;

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col border-r border-[var(--color-border)] z-40"
      style={{ backgroundColor: "var(--nav-bg)", backdropFilter: "blur(20px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--color-border)]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ background: "var(--accent-gradient)" }}
        >
          AI
        </div>
        <span className="font-bold text-[var(--color-text)] text-base">
          CampaignMgr
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <Link href="/clients" className={linkClass(isActive("/clients"))}>
          <Users className="w-[18px] h-[18px]" />
          Clientes
        </Link>

        {/* Campanhas section */}
        <div className="mt-4 mb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] opacity-60">
            Campanhas
          </span>
        </div>

        <button
          onClick={() => setCampaignsOpen(!campaignsOpen)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full cursor-pointer ${
            isCampaignActive && !campaignsOpen
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          }`}
        >
          <Megaphone className="w-[18px] h-[18px]" />
          <span className="flex-1 text-left">Campanhas</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              campaignsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {campaignsOpen && (
          <div className="ml-4 flex flex-col gap-0.5">
            <Link
              href="/campaigns"
              className={linkClass(isActive("/campaigns"))}
            >
              <List className="w-[16px] h-[16px]" />
              Todas as Campanhas
            </Link>
            <Link
              href="/campaigns/new"
              className={linkClass(isActive("/campaigns/new"))}
            >
              <PlusCircle className="w-[16px] h-[16px]" />
              Nova Campanha
            </Link>
          </div>
        )}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-all duration-200 w-full cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-[18px] h-[18px]" />
          ) : (
            <Moon className="w-[18px] h-[18px]" />
          )}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </button>
      </div>

      {/* User */}
      <div className="relative border-t border-[var(--color-border)] px-3 py-3" ref={menuRef}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "var(--accent-gradient)" }}
          >
            {user ? getInitials(user.name) : "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {user?.name || "Usuário"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="p-1 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {userMenuOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-[var(--color-border)] shadow-lg overflow-hidden"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--color-accent,#ea5153)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
