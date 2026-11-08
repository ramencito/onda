import { Link, useLocation } from "react-router-dom";
import { Home, Library, Search } from "lucide-react";

const items = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/search", label: "Buscar", icon: Search },
  { to: "/library", label: "Biblioteca", icon: Library },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="shrink-0 border-t border-white/5 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex h-[60px] items-stretch">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to ||
            (to === "/library" && (pathname.startsWith("/playlist") || pathname === "/liked"));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                active ? "text-white" : "text-muted active:text-white"
              }`}
            >
              <Icon size={23} strokeWidth={active ? 2.4 : 1.9} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.18 : 0} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
