import { ArrowDown, Activity, Brain, Dumbbell } from "lucide-react";

interface HeroProps {
  onNavigate: (section: string) => void;
}

const stats = [
  { label: "AI-Powered", icon: Brain },
  { label: "Sports Plans", icon: Dumbbell },
  { label: "Health Tracking", icon: Activity },
];

const HeroSection = ({ onNavigate }: HeroProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
          Your Smart
          <br />
          <span className="text-gradient">Fitness Coach</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
          NCC Sports AI Platform - Calculate BMI, get AI sport recommendations, personalized diet & workout plans — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => onNavigate("bmi")}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:brightness-110 transition-all active:scale-[0.98] text-lg"
          >
            Calculate BMI
          </button>
          <button
            onClick={() => onNavigate("chat")}
            className="bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary/80 transition-all active:scale-[0.98] text-lg border border-border"
          >
            Talk to AI Coach
          </button>
        </div>

        <div className="flex justify-center gap-8 md:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigate("bmi")}
          className="mt-16 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <ArrowDown className="w-6 h-6 mx-auto" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
