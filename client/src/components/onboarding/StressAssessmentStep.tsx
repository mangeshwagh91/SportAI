import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { OnboardingData } from '../OnboardingWizard';

interface StressAssessmentStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const stressQuestions = [
  // Emotional/Psychological Wellbeing (3 questions)
  { id: 1, text: 'How often do you feel overwhelmed by your responsibilities or workload?', category: 'emotional', answerType: 'frequency' },
  { id: 2, text: 'How frequently do you experience feelings of anxiety or worry?', category: 'emotional', answerType: 'frequency' },
  { id: 3, text: 'How often do you feel irritable, frustrated, or have difficulty controlling your emotions?', category: 'emotional', answerType: 'frequency' },
  
  // Physical Health & Energy (3 questions)
  { id: 4, text: 'How would you rate the quality of your sleep (falling asleep, staying asleep, feeling rested)?', category: 'physical', answerType: 'quality' },
  { id: 5, text: 'How often do you experience physical symptoms like headaches, muscle tension, or fatigue?', category: 'physical', answerType: 'frequency' },
  { id: 6, text: 'How would you describe your overall energy levels throughout the day?', category: 'physical', answerType: 'quality' },
  
  // Work-Life Balance (3 questions)
  { id: 7, text: 'How balanced do you feel between your work/study demands and personal life?', category: 'worklife', answerType: 'balance' },
  { id: 8, text: 'How often are you able to take meaningful breaks and disconnect from work/study?', category: 'worklife', answerType: 'frequencyPositive' },
  { id: 9, text: 'How satisfied are you with the amount of time you have for hobbies and relaxation?', category: 'worklife', answerType: 'satisfaction' },
  
  // Social & Relationships (2 questions)
  { id: 10, text: 'How satisfied are you with your social connections and support system?', category: 'social', answerType: 'satisfaction' },
  { id: 11, text: 'How often do you feel lonely or isolated from others?', category: 'social', answerType: 'frequency' },
  
  // Coping & Resilience (2 questions)
  { id: 12, text: 'How well do you feel you cope with unexpected challenges or setbacks?', category: 'coping', answerType: 'ability' },
  { id: 13, text: 'How often do you engage in stress-relief activities (exercise, meditation, hobbies)?', category: 'coping', answerType: 'frequencyPositive' },
];

const answerOptionSets = {
  frequency: [
    { value: 1, label: 'Never', description: 'Not at all' },
    { value: 2, label: 'Rarely', description: 'Once in a while' },
    { value: 3, label: 'Sometimes', description: 'Occasionally' },
    { value: 4, label: 'Often', description: 'Frequently' },
    { value: 5, label: 'Always', description: 'Constantly' },
  ],
  frequencyPositive: [
    { value: 5, label: 'Never', description: 'Not at all' },
    { value: 4, label: 'Rarely', description: 'Once in a while' },
    { value: 3, label: 'Sometimes', description: 'Occasionally' },
    { value: 2, label: 'Often', description: 'Frequently' },
    { value: 1, label: 'Always', description: 'Constantly' },
  ],
  quality: [
    { value: 5, label: 'Very Poor', description: 'Extremely low quality' },
    { value: 4, label: 'Poor', description: 'Below average' },
    { value: 3, label: 'Fair', description: 'Average, moderate' },
    { value: 2, label: 'Good', description: 'Above average' },
    { value: 1, label: 'Excellent', description: 'Outstanding quality' },
  ],
  satisfaction: [
    { value: 5, label: 'Very Dissatisfied', description: 'Not satisfied at all' },
    { value: 4, label: 'Dissatisfied', description: 'Below expectations' },
    { value: 3, label: 'Neutral', description: 'Neither satisfied nor dissatisfied' },
    { value: 2, label: 'Satisfied', description: 'Meets expectations' },
    { value: 1, label: 'Very Satisfied', description: 'Exceeds expectations' },
  ],
  balance: [
    { value: 5, label: 'Very Unbalanced', description: 'Severely out of balance' },
    { value: 4, label: 'Unbalanced', description: 'Leaning too much one way' },
    { value: 3, label: 'Somewhat Balanced', description: 'Average balance' },
    { value: 2, label: 'Balanced', description: 'Good balance' },
    { value: 1, label: 'Very Balanced', description: 'Excellent balance' },
  ],
  ability: [
    { value: 5, label: 'Very Poorly', description: 'Struggle significantly' },
    { value: 4, label: 'Poorly', description: 'Find it difficult' },
    { value: 3, label: 'Adequately', description: 'Manage okay' },
    { value: 2, label: 'Well', description: 'Handle it effectively' },
    { value: 1, label: 'Very Well', description: 'Excel at coping' },
  ],
};

export const StressAssessmentStep = ({
  data,
  updateData,
  nextStep,
  prevStep,
}: StressAssessmentStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(data.stressAnswers || []);

  const progress = ((currentQuestion + 1) / stressQuestions.length) * 100;
  const currentAnswerOptions = answerOptionSets[stressQuestions[currentQuestion].answerType];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < stressQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }, 300);
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = () => {
    if (answers.length !== stressQuestions.length || answers.some((a) => !a)) {
      alert('Please answer all questions before continuing');
      return;
    }

    // Calculate overall stress level
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = stressQuestions.length * 5;
    const stressLevel = Math.round((totalScore / maxScore) * 100);

    // Calculate category-specific scores
    const emotionalScore = (answers[0] + answers[1] + answers[2]) / 3; // Q1-3
    const physicalScore = (answers[3] + answers[4] + answers[5]) / 3; // Q4-6
    const workLifeScore = (answers[6] + answers[7] + answers[8]) / 3; // Q7-9
    const socialScore = (answers[9] + answers[10]) / 2; // Q10-11
    const copingScore = (answers[11] + answers[12]) / 2; // Q12-13

    // Determine work-life balance based on Q7-9 (inverted scale for positive questions)
    const workLifeBalance =
      workLifeScore <= 2 ? 'excellent' : 
      workLifeScore <= 3 ? 'good' : 
      workLifeScore <= 4 ? 'fair' : 'needs improvement';

    // Determine sleep quality based on Q4 (inverted for positive framing)
    const sleepQuality =
      answers[3] <= 2 ? 'excellent' : 
      answers[3] <= 3 ? 'good' : 
      answers[3] <= 4 ? 'fair' : 'poor';

    // Identify primary stress area
    const categories = {
      emotional: emotionalScore,
      physical: physicalScore,
      workLife: workLifeScore,
      social: socialScore,
      coping: copingScore
    };
    
    const primaryStressArea = Object.entries(categories)
      .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'emotional', value: 0 })
      .key;

    updateData({
      stressAnswers: answers,
      stressLevel,
      workLifeBalance,
      sleepQuality,
      primaryStressArea,
    });

    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Wellness & Stress Assessment</h3>
        <p className="text-sm text-muted-foreground mb-2">
          We'll assess 5 key areas: emotional wellbeing, physical health, work-life balance, social connections, and coping skills.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Question {currentQuestion + 1} of {stressQuestions.length}
        </p>
        <Progress value={progress} className="mb-6" />
      </div>

      <div className="min-h-[300px]">
        <div className="mb-6">
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              Question {currentQuestion + 1}
            </Badge>
          </div>
          <Label className="text-base mb-4 block font-medium">
            {stressQuestions[currentQuestion].text}
          </Label>
          <RadioGroup
            value={answers[currentQuestion]?.toString() || ''}
            onValueChange={(value) => handleAnswer(parseInt(value))}
          >
            <div className="space-y-3">
              {currentAnswerOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                    answers[currentQuestion] === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`option-${option.value}`}
                  />
                  <div className="flex-1 cursor-pointer">
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="cursor-pointer font-medium block"
                    >
                      {option.label}
                    </Label>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Question navigation dots */}
        <div className="flex justify-center gap-2 mt-6">
          {stressQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentQuestion
                  ? 'bg-primary w-8'
                  : answers[index]
                  ? 'bg-primary/60'
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          onClick={currentQuestion === 0 ? prevStep : handlePrevQuestion}
          variant="outline"
        >
          Back
        </Button>
        
        {currentQuestion === stressQuestions.length - 1 && answers[currentQuestion] ? (
          <Button onClick={handleComplete}>
            Continue to Results
          </Button>
        ) : (
          <Button
            onClick={() =>
              currentQuestion < stressQuestions.length - 1 &&
              setCurrentQuestion(currentQuestion + 1)
            }
            disabled={!answers[currentQuestion]}
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};
