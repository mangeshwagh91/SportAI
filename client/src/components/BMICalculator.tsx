import { useState } from "react";
import { Calculator, ArrowRight, Scale, Ruler, Calendar } from "lucide-react";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
}

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return;

    const bmi = w / (h * h);
    let category = "";
    let color = "";

    if (bmi < 18.5) { category = "Underweight"; color = "text-blue-400"; }
    else if (bmi < 25) { category = "Normal"; color = "text-primary"; }
    else if (bmi < 30) { category = "Overweight"; color = "text-yellow-400"; }
    else { category = "Obese"; color = "text-destructive"; }

    setResult({ bmi: Math.round(bmi * 10) / 10, category, color });
  };

  return (
    <section id="bmi" className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold mb-3">
            <span className="text-gradient">BMI</span> Calculator
          </h2>
          <p className="text-muted-foreground text-lg">Know your body, unlock your potential</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Scale className="w-4 h-4" /> Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              onClick={calculateBMI}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <Calculator className="w-5 h-5" /> Calculate BMI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-card p-8 flex flex-col items-center justify-center">
            {result ? (
              <div className="text-center space-y-4 animate-in fade-in duration-500">
                <div className="text-7xl font-display font-bold text-gradient">{result.bmi}</div>
                <div className={`text-2xl font-semibold ${result.color}`}>{result.category}</div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mt-6">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((result.bmi / 40) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-3">
                <Calculator className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-lg">Enter your details to see your BMI</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BMICalculator;
