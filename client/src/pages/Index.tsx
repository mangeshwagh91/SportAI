import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { EnhancedBMICalculator } from "@/components/EnhancedBMICalculator";
import { AIRecommendationsEnhanced } from "@/components/AIRecommendationsEnhanced";
import { AIFitnessChat } from "@/components/AIFitnessChat";
import { FitnessGoalsManager } from "@/components/FitnessGoalsManager";
import { 
  BMICalculatorPreview, 
  FitnessGoalsPreview, 
  AIRecommendationsPreview, 
  AIFitnessChatPreview 
} from "@/components/PreviewComponents";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'register'>('login');
  const { user } = useAuth();

  const navigateTo = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginPrompt = (tab: 'login' | 'register' = 'login') => {
    setAuthDialogTab(tab);
    setAuthDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} onNavigate={navigateTo} />
      
      <div id="home">
        <HeroSection onNavigate={navigateTo} onLoginPrompt={handleLoginPrompt} />
      </div>
      
      <div id="bmi" className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          {user ? (
            <EnhancedBMICalculator />
          ) : (
            <BMICalculatorPreview onLoginPrompt={() => handleLoginPrompt('login')} />
          )}
        </div>
      </div>
      
      <div id="goals" className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4">
          {user ? (
            <FitnessGoalsManager />
          ) : (
            <FitnessGoalsPreview onLoginPrompt={() => handleLoginPrompt('login')} />
          )}
        </div>
      </div>
      
      <div id="recommendations" className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          {user ? (
            <AIRecommendationsEnhanced />
          ) : (
            <AIRecommendationsPreview onLoginPrompt={() => handleLoginPrompt('login')} />
          )}
        </div>
      </div>
      
      <div id="chat" className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4">
          {user ? (
            <AIFitnessChat />
          ) : (
            <AIFitnessChatPreview onLoginPrompt={() => handleLoginPrompt('login')} />
          )}
        </div>
      </div>
      
      <footer className="py-8 border-t border-border/30 text-center text-sm text-muted-foreground">
        <p>SportAI — Your AI-Powered Fitness Companion</p>
      </footer>

      {/* Auth Dialog for login prompts */}
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
      />
    </div>
  );
};

export default Index;
