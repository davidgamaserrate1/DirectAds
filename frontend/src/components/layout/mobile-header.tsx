"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]"
        style={{
          backgroundColor: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
            style={{ background: "var(--accent-gradient)" }}
          >
            AI
          </div>
          <span className="font-bold text-sm text-[var(--color-text)]">
            CampaignMgr
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
        >
          {open ? (
            <X className="w-5 h-5 text-[var(--color-text)]" />
          ) : (
            <Menu className="w-5 h-5 text-[var(--color-text)]" />
          )}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px]">
            <Sidebar />
          </div>
        </>
      )}
    </>
  );
}
