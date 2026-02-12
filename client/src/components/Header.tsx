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
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-red-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <img 
              src="/NCC_logo_full_HD-removebg-preview.png" 
              alt="NCC Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image not found
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<div class="text-primary font-bold text-xs">NCC</div>';
                }
              }}
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-display font-bold text-sm md:text-base text-foreground leading-tight">OTA Kamptee</span>
            <span className="font-display font-semibold text-xs text-primary leading-tight">Rana Pratap Company</span>
          </div>
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
