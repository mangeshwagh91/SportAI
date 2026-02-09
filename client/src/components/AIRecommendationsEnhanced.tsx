import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Brain, 
  Dumbbell, 
  Target, 
  Clock, 
  Users, 
  Trophy,
  Zap,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

interface SportRecommendation {
  name: string;
  reason: string;
  tips: string;
  benefits: string;
}

interface WorkoutPlan {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  targetGoals: string[];
  exercises: Array<{
    name: string;
    description: string;
    sets: number;
    reps: string;
    restTime: number;
    equipment: string[];
    muscleGroups: string[];
  }>;
  weeklySchedule: Array<{
    day: string;
    exerciseIndexes: number[];
  }>;
  createdAt: string;
}

interface DietPlan {
  _id: string;
  title: string;
  description: string;
  goalType: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Array<{
    type: string;
    name: string;
    description: string;
    calories: number;
    ingredients: string[];
  }>;
  createdAt: string;
}

export const AIRecommendationsEnhanced = () => {
  const [sportRecommendations, setSportRecommendations] = useState<SportRecommendation[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sports');
  
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchWorkoutPlans();
      fetchDietPlans();
    }
  }, [user, token]);

  const fetchSportRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/ai/sports-recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSportRecommendations(data.data.recommendations);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch sport recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWorkoutPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/ai/workout-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: {
            duration: 45,
            equipment: 'minimal',
            frequency: '3-4 times week'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchWorkoutPlans();
        setActiveTab('workouts');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to generate workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDietPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/ai/diet-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: {
            dietaryRestrictions: [],
            mealCount: 3
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchDietPlans();
        setActiveTab('diet');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to generate diet plan');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/workout-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setWorkoutPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    }
  };

  const fetchDietPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/diet-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDietPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatGoalType = (goalType: string) => {
    return goalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please log in to get personalized AI recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI-Powered Fitness Coach</h2>
        <p className="text-muted-foreground">
          Get personalized recommendations based on your profile and goals
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sports">Sport Recommendations</TabsTrigger>
          <TabsTrigger value="workouts">Workout Plans</TabsTrigger>
          <TabsTrigger value="diet">Diet Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="sports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommended Sports
              </CardTitle>
              <CardDescription>
                AI-suggested sports activities based on your BMI, age, and fitness level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={fetchSportRecommendations}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Get AI Sport Recommendations'}
                </Button>

                {sportRecommendations.length > 0 && (
                  <div className="grid gap-4">
                    {sportRecommendations.map((sport, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-primary" />
                                {sport.name}
                              </h3>
                              <Badge variant="outline">
                                <Star className="w-3 h-3 mr-1" />
                                AI Recommended
                              </Badge>
                            </div>
                            
                            <div className="grid gap-3">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Why it's perfect for you</h4>
                                <p className="text-sm">{sport.reason}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Beginner tips</h4>
                                <p className="text-sm">{sport.tips}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Expected benefits</h4>
                                <p className="text-sm">{sport.benefits}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Personalized Workout Plans
              </CardTitle>
              <CardDescription>
                AI-generated workout routines tailored to your fitness goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={generateWorkoutPlan}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Generate New Workout Plan'}
                </Button>

                {workoutPlans.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Workout Plans</h3>
                    {workoutPlans.map((plan) => (
                      <Card key={plan._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">{plan.title}</h4>
                              <div className="flex gap-2">
                                <Badge className={getDifficultyColor(plan.difficulty)}>
                                  {plan.difficulty}
                                </Badge>
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {plan.duration}min
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            
                            {plan.targetGoals && plan.targetGoals.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {plan.targetGoals.map((goal, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {formatGoalType(goal)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(plan.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personalized Nutrition Plans
              </CardTitle>
              <CardDescription>
                AI-crafted diet plans based on your goals and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={generateDietPlan}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Generate New Diet Plan'}
                </Button>

                {dietPlans.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Diet Plans</h3>
                    {dietPlans.map((plan) => (
                      <Card key={plan._id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">{plan.title}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  {formatGoalType(plan.goalType)}
                                </Badge>
                                <Badge variant="secondary">
                                  {plan.dailyCalories} cal/day
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            
                            {plan.macros && (
                              <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/30 rounded-lg">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-primary">{plan.macros.protein}%</div>
                                  <div className="text-xs text-muted-foreground">Protein</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-primary">{plan.macros.carbs}%</div>
                                  <div className="text-xs text-muted-foreground">Carbs</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-primary">{plan.macros.fats}%</div>
                                  <div className="text-xs text-muted-foreground">Fats</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(plan.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};