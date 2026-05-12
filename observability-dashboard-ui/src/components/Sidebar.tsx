"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Server,
  FileText,
  Zap,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname || "/");

  const menuItems = [
    {
      section: "OVERVIEW",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: Activity, label: "Activity", href: "/activity" },
      ],
    },
    {
      section: "MONITORING",
      items: [
        { icon: Server, label: "Services", href: "/services" },
        { icon: Activity, label: "Metrics", href: "/metrics" },
        { icon: FileText, label: "Logs", href: "/logs" },
        { icon: Zap, label: "Traces", href: "/traces" },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { icon: AlertTriangle, label: "Alerts", href: "/alerts" },
        { icon: AlertTriangle, label: "Incidents", href: "/incidents" },
        { icon: HelpCircle, label: "Help", href: "/help" },
      ],
    },
    {
      section: "ORGANIZATION",
      items: [{ icon: Settings, label: "Settings", href: "/settings" }],
    },
  ];

  return (
    <div
      className={`sidebar h-full flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-white">ObserveOps</span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ left: collapsed ? "auto" : "auto", right: "-12px" }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!collapsed && (
              <div className={section.section === "OVERVIEW" ? "" : "mt-6"}>
                <div className="sidebar-section-title">{section.section}</div>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`sidebar-item ${
                      activeItem === item.href ? "active" : ""
                    } ${collapsed ? "justify-center" : ""}`}
                    onClick={() => setActiveItem(item.href)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-800">
        <Link href="/help">
          <div className={`sidebar-item ${collapsed ? "justify-center" : ""}`}>
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Help & Support</span>
            )}
          </div>
        </Link>
        <Link href="/logout">
          <div className={`sidebar-item ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Log out</span>}
          </div>
        </Link>
      </div>
    </div>
  );
}
