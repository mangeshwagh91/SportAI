import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { OnboardingData } from '../OnboardingWizard';
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  Moon, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';

interface OnboardingResultsStepProps {
  data: OnboardingData;
  completeOnboarding: () => void;
  prevStep: () => void;
  isLoading: boolean;
}

export const OnboardingResultsStep = ({
  data,
  completeOnboarding,
  prevStep,
  isLoading,
}: OnboardingResultsStepProps) => {
  const calculateBMI = () => {
    if (data.weight && data.height) {
      const heightInMeters = data.height / 100;
      return (data.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'bg-blue-500' };
    if (bmiValue < 25) return { label: 'Normal', color: 'bg-green-500' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'bg-yellow-500' };
    return { label: 'Obese', color: 'bg-red-500' };
  };

  const getStressLevelCategory = (level?: number) => {
    if (!level) return { label: 'Unknown', color: 'bg-gray-500' };
    if (level < 40) return { label: 'High Stress', color: 'bg-red-500' };
    if (level < 60) return { label: 'Moderate Stress', color: 'bg-yellow-500' };
    return { label: 'Low Stress', color: 'bg-green-500' };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const stressCategory = getStressLevelCategory(data.stressLevel);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Your Profile Summary</h3>
        <p className="text-muted-foreground">
          Here's an overview of your fitness profile
        </p>
      </div>

      <div className="grid gap-4">
        {/* Basic Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{data.age} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium">{data.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Height</p>
                    <p className="font-medium">{data.height} cm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fitness Level</p>
                    <Badge variant="secondary" className="mt-1">
                      {data.fitnessLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Body Mass Index</h4>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">{bmi}</div>
                  <Badge className={`${bmiCategory.color} text-white`}>
                    {bmiCategory.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stress Level Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Wellness Assessment</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Wellness</span>
                    <Badge className={`${stressCategory.color} text-white`}>
                      {stressCategory.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Moon className="w-4 h-4" />
                    <span className="text-muted-foreground">Sleep Quality:</span>
                    <Badge variant="outline">{data.sleepQuality}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-muted-foreground">Work-Life Balance:</span>
                    <Badge variant="outline">{data.workLifeBalance}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline" disabled={isLoading}>
          Back
        </Button>
        <Button onClick={completeOnboarding} disabled={isLoading} size="lg">
          {isLoading ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};
