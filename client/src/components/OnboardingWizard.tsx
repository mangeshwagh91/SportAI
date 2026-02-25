import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BasicInfoStep, StressAssessmentStep, OnboardingResultsStep } from './onboarding';

export interface OnboardingData {
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel?: string;
  goals?: string[];
  stressAnswers?: number[];
  stressLevel?: number;
  workLifeBalance?: string;
  sleepQuality?: string;
  primaryStressArea?: string;
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData({ ...onboardingData, ...data });
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const response = await authService.completeOnboarding(onboardingData);
      updateUser(response.user);
      navigate('/');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <StressAssessmentStep
            data={onboardingData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <OnboardingResultsStep
            data={onboardingData}
            completeOnboarding={completeOnboarding}
            prevStep={prevStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome {user?.name}! Let's get you started</CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  );
};
