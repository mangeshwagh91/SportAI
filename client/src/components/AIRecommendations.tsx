import { useState } from "react";
import { Dumbbell, Zap, Apple, AlertTriangle, Sparkles, Loader2 } from "lucide-react";

const mockRecommendations = {
  sports: [
    { name: "Swimming", reason: "Low-impact, full-body workout perfect for your profile", icon: "🏊" },
    { name: "Cycling", reason: "Great cardio that's easy on joints", icon: "🚴" },
    { name: "Yoga", reason: "Improves flexibility and mental wellness", icon: "🧘" },
  ],
  workout: [
    "3x weekly strength training (30 min)",
    "2x cardio sessions (20 min)",
    "Daily stretching (10 min)",
    "Weekend active recovery walk",
  ],
  diet: [
    "High protein breakfast (eggs, oats)",
    "Lean protein with each meal",
    "5 servings of fruits/vegetables daily",
    "Stay hydrated: 2-3L water/day",
  ],
  warnings: ["Start slow if new to exercise", "Consult a doctor before intense training"],
};

const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <section id="recommendations" className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3">
            AI <span className="text-gradient">Coach</span>
          </h2>
          <p className="text-muted-foreground text-lg">Personalized fitness recommendations powered by AI</p>
        </div>

        {!generated ? (
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
            <h3 className="font-display text-2xl font-bold mb-3 text-foreground">Get Your AI Plan</h3>
            <p className="text-muted-foreground mb-8">
              Calculate your BMI first, then let AI create a personalized fitness plan for you.
            </p>
            <button
              onClick={generate}
              disabled={loading}
              className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg flex items-center gap-2 mx-auto hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Generating..." : "Generate My Plan"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-700">
            {/* Sports */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Dumbbell className="w-5 h-5 text-primary" /> Recommended Sports
              </h3>
              <div className="space-y-3">
                {mockRecommendations.sports.map((s) => (
                  <div key={s.name} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-semibold text-foreground">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-primary" /> Weekly Workout
              </h3>
              <ul className="space-y-2">
                {mockRecommendations.workout.map((w, i) => (
                  <li key={i} className="flex items-center gap-3 text-secondary-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Diet */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Apple className="w-5 h-5 text-primary" /> Diet Plan
              </h3>
              <ul className="space-y-2">
                {mockRecommendations.diet.map((d, i) => (
                  <li key={i} className="flex items-center gap-3 text-secondary-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="glass-card p-6 border-destructive/30">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-5 h-5 text-yellow-400" /> Health Notes
              </h3>
              <ul className="space-y-2">
                {mockRecommendations.warnings.map((w, i) => (
                  <li key={i} className="flex items-center gap-3 text-secondary-foreground">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRecommendations;
