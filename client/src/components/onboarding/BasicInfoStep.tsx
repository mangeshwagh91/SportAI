import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { OnboardingData } from '../OnboardingWizard';

interface BasicInfoStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
}

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Regular exerciser' },
];

const goalOptions = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'endurance', label: 'Build Endurance' },
  { id: 'flexibility', label: 'Improve Flexibility' },
  { id: 'general_fitness', label: 'General Fitness' },
  { id: 'stress_relief', label: 'Stress Relief' },
];

export const BasicInfoStep = ({ data, updateData, nextStep }: BasicInfoStepProps) => {
  const [age, setAge] = useState<string>(data.age?.toString() || '');
  const [weight, setWeight] = useState<string>(data.weight?.toString() || '');
  const [height, setHeight] = useState<string>(data.height?.toString() || '');
  const [fitnessLevel, setFitnessLevel] = useState<string>(data.fitnessLevel || '');
  const [goals, setGoals] = useState<string[]>(data.goals || []);

  const handleGoalToggle = (goalId: string) => {
    if (goals.includes(goalId)) {
      setGoals(goals.filter((g) => g !== goalId));
    } else {
      setGoals([...goals, goalId]);
    }
  };

  const handleNext = () => {
    if (!age || !weight || !height || !fitnessLevel || goals.length === 0) {
      alert('Please complete all fields before continuing');
      return;
    }

    updateData({
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      fitnessLevel,
      goals,
    });

    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tell us about yourself</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="13"
              max="120"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="20"
              max="300"
              step="0.1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="100"
              max="250"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base mb-3 block">Fitness Level</Label>
        <RadioGroup value={fitnessLevel} onValueChange={setFitnessLevel}>
          <div className="grid gap-3">
            {fitnessLevels.map((level) => (
              <div
                key={level.value}
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  fitnessLevel === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFitnessLevel(level.value)}
              >
                <RadioGroupItem value={level.value} id={level.value} />
                <div className="flex-1">
                  <Label htmlFor={level.value} className="cursor-pointer font-medium">
                    {level.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base mb-3 block">Fitness Goals (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalOptions.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                goals.includes(goal.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <Checkbox
                id={goal.id}
                checked={goals.includes(goal.id)}
                onCheckedChange={() => handleGoalToggle(goal.id)}
              />
              <Label htmlFor={goal.id} className="cursor-pointer flex-1">
                {goal.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};
