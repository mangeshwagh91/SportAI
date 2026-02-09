import { Calculator, TrendingUp, Activity, AlertTriangle, LogIn, Target, Plus, Brain, Dumbbell, MessageCircle, Bot, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface PreviewComponentProps {
  onLoginPrompt: () => void;
}

export const BMICalculatorPreview = ({ onLoginPrompt }: PreviewComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8" />
          BMI Calculator
        </h2>
        <p className="text-muted-foreground text-lg">
          Calculate your Body Mass Index and track your health journey
        </p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                BMI Calculator
              </CardTitle>
              <CardDescription>
                Calculate your Body Mass Index and track your health journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-50 pointer-events-none">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value="170"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value="70"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value="25"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value=""
                    readOnly
                  />
                </div>

                <Button type="button" className="w-full" disabled>
                  Calculate BMI
                </Button>
              </div>

              {/* Sample result */}
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg opacity-50">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">24.2</h3>
                  <Badge className="bg-green-100 text-green-800">
                    Normal weight
                  </Badge>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to calculate your BMI and track your progress
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                BMI History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-50">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">BMI: 24.2</div>
                    <div className="text-sm text-muted-foreground">
                      70kg • 170cm
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Jan 15, 2026
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Normal weight
                  </Badge>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to view your BMI history
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                BMI Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 opacity-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">-0.5</div>
                    <div className="text-sm text-muted-foreground">BMI Change</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">-2kg</div>
                    <div className="text-sm text-muted-foreground">Weight Change</div>
                  </div>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to view your analytics and progress
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const FitnessGoalsPreview = ({ onLoginPrompt }: PreviewComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Target className="w-8 h-8" />
          Fitness Goals
        </h2>
        <p className="text-muted-foreground text-lg">
          Set and track your fitness objectives to stay motivated
        </p>
      </div>
      
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>
                Set and track your fitness objectives to stay motivated
              </CardDescription>
            </div>
            
            <Button disabled className="opacity-50">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 opacity-50">
            {/* Sample goals */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Lose 10kg</h3>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Target Date: March 15, 2026
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">75% complete</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Run 5K</h3>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Target Date: February 1, 2026
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">100% complete</p>
            </div>
          </div>

          {/* Login overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center space-y-4 max-w-sm">
              <LogIn className="w-12 h-12 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Login Required</h3>
                <p className="text-muted-foreground text-sm">
                  Sign in to create and track your fitness goals
                </p>
              </div>
              <Button onClick={onLoginPrompt} className="w-full">
                Sign In to Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AIRecommendationsPreview = ({ onLoginPrompt }: PreviewComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Brain className="w-8 h-8" />
          AI-Powered Fitness Coach
        </h2>
        <p className="text-muted-foreground text-lg">
          Get personalized recommendations based on your profile and goals
        </p>
      </div>

      <Tabs defaultValue="sports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sports">Sport Recommendations</TabsTrigger>
          <TabsTrigger value="workouts">Workout Plans</TabsTrigger>
          <TabsTrigger value="diet">Diet Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="sports" className="space-y-6">
          <Card className="relative">
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
              <div className="space-y-4 opacity-50">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">🏃‍♂️ Running</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Perfect for improving cardiovascular health and weight management
                  </p>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">🧘‍♀️ Yoga</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Great for flexibility, strength, and mental well-being
                  </p>
                  <Badge variant="secondary">Beginner Friendly</Badge>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to get personalized AI recommendations
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Workout Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-50">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Beginner Full Body Workout</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Perfect starter routine for building strength and endurance
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">30 mins</Badge>
                    <Badge variant="outline">3x/week</Badge>
                  </div>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to get personalized workout plans
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="space-y-6">
          <Card className="relative">
            <CardHeader>
              <CardTitle>Diet Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-50">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Healthy Weight Loss Plan</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Balanced meals for sustainable weight loss
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">1800 cal/day</Badge>
                    <Badge variant="outline">High protein</Badge>
                  </div>
                </div>
              </div>

              {/* Login overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 max-w-sm">
                  <LogIn className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Login Required</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign in to get personalized diet plans
                    </p>
                  </div>
                  <Button onClick={onLoginPrompt} className="w-full">
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const AIFitnessChatPreview = ({ onLoginPrompt }: PreviewComponentProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Brain className="w-8 h-8" />
          AI Fitness Coach
        </h2>
        <p className="text-muted-foreground text-lg">
          Get personalized fitness guidance through our AI-powered chat assistant
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Chat Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Chat Sessions
                <Button size="sm" disabled className="opacity-50">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 p-3 opacity-50">
                  <div className="p-3 rounded-lg border">
                    <div className="text-sm font-medium">Weight Loss Tips</div>
                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="text-sm font-medium">Workout Routine</div>
                    <div className="text-xs text-muted-foreground">Yesterday</div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            
            {/* Login overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3 max-w-[200px]">
                <LogIn className="w-8 h-8 text-primary mx-auto" />
                <div>
                  <h4 className="text-sm font-semibold">Login Required</h4>
                  <p className="text-xs text-muted-foreground">
                    Sign in to chat with AI
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">AI Fitness Coach</CardTitle>
              <CardDescription>
                Ask questions about workouts, nutrition, or get personalized advice
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 opacity-50">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Sample messages */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          Hello! I'm your AI fitness coach. I can help you with workout routines, nutrition advice, and answer any fitness-related questions you have.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                        <p className="text-sm">
                          What's the best workout routine for beginners?
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex gap-2 mt-4 opacity-50">
                <Input
                  placeholder="Ask about workouts, nutrition, or sports recommendations..."
                  value=""
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" disabled>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
            
            {/* Login overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4 max-w-sm">
                <LogIn className="w-12 h-12 text-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Login Required</h3>
                  <p className="text-muted-foreground text-sm">
                    Sign in to chat with your AI fitness coach
                  </p>
                </div>
                <Button onClick={onLoginPrompt} className="w-full">
                  Sign In to Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};