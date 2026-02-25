import { TrendingUp, BarChart3, ClipboardList, Wallet } from "lucide-react";

type Page = "trade" | "markets" | "orders" | "wallet";

interface BottomNavProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

const items: { id: Page; label: string; icon: typeof TrendingUp }[] = [
  { id: "trade", label: "Trade", icon: TrendingUp },
  { id: "markets", label: "Markets", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "wallet", label: "Assets", icon: Wallet },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-50">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
            active === id ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </nav>
  );
}
