import { Activity, Dumbbell, MessageCircle, TrendingUp, Target } from "lucide-react";
import { AuthButtons } from "./AuthButtons";

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Activity },
  { id: "bmi", label: "BMI Calculator", icon: TrendingUp },
  { id: "goals", label: "Fitness Goals", icon: Target },
  { id: "recommendations", label: "AI Coach", icon: Dumbbell },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

const Header = ({ activeSection, onNavigate }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">FitAI</span>
        </button>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <AuthButtons />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded-lg transition-all ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
