import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

interface BMIRecord {
  _id: string;
  height: number;
  weight: number;
  age: number;
  bmi: number;
  category: string;
  notes?: string;
  createdAt: string;
}

interface BMIAnalytics {
  current: BMIRecord;
  progress?: {
    bmiChange: number;
    weightChange: number;
    daysBetween: number;
  };
  monthlyData: Array<{
    month: string;
    averageBMI: number;
  }>;
  healthRecommendations: {
    category: string;
    recommendations: string[];
    riskLevel: string;
  };
}

export const EnhancedBMICalculator = () => {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    notes: ''
  });
  const [currentBMI, setCurrentBMI] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bmiHistory, setBmiHistory] = useState<BMIRecord[]>([]);
  const [analytics, setAnalytics] = useState<BMIAnalytics | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchBMIHistory();
      fetchBMIAnalytics();
    }
  }, [user, token]);

  const fetchBMIHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/bmi/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBmiHistory(data.data.records);
      }
    } catch (error) {
      console.error('Error fetching BMI history:', error);
    }
  };

  const fetchBMIAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/bmi/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.data.current) {
        setAnalytics(data.data);
        setCurrentBMI(data.data.current.bmi);
        setCategory(data.data.current.category);
      }
    } catch (error) {
      console.error('Error fetching BMI analytics:', error);
    }
  };

  const calculateBMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/bmi/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          age: parseInt(formData.age),
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentBMI(data.data.bmi);
        setCategory(data.data.category);
        setFormData({ height: '', weight: '', age: '', notes: '' });
        
        // Refresh history and analytics
        fetchBMIHistory();
        fetchBMIAnalytics();
      } else {
        setError(data.message || 'Failed to calculate BMI');
      }

    } catch (error: any) {
      setError('Error calculating BMI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBMICategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight': return 'bg-blue-100 text-blue-800';
      case 'Normal weight': return 'bg-green-100 text-green-800';
      case 'Overweight': return 'bg-yellow-100 text-yellow-800';
      case 'Obese': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8" />
            BMI Calculator
          </h2>
          <p className="text-muted-foreground text-lg">
            Calculate your Body Mass Index and track your health journey
          </p>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to use the BMI calculator and track your progress.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Card>
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
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={calculateBMI} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      required
                      min="50"
                      max="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                      min="20"
                      max="500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    min="10"
                    max="150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    maxLength={500}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Calculating...' : 'Calculate BMI'}
                </Button>
              </form>

              {currentBMI && (
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{currentBMI}</h3>
                    <Badge className={getBMICategoryColor(category)}>
                      {category}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                BMI History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bmiHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No BMI history yet. Calculate your first BMI to start tracking!
                </p>
              ) : (
                <div className="space-y-4">
                  {bmiHistory.slice(0, 5).map((record) => (
                    <div
                      key={record._id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">BMI: {record.bmi}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.weight}kg • {record.height}cm
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={getBMICategoryColor(record.category)}>
                        {record.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                BMI Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analytics ? (
                <p className="text-center text-muted-foreground py-8">
                  No analytics available yet. Calculate your BMI to see insights!
                </p>
              ) : (
                <div className="space-y-6">
                  {analytics.progress && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analytics.progress.bmiChange > 0 ? '+' : ''}{analytics.progress.bmiChange}
                        </div>
                        <div className="text-sm text-muted-foreground">BMI Change</div>
                      </div>
                      <div className="text-center p-4 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analytics.progress.weightChange > 0 ? '+' : ''}{analytics.progress.weightChange}kg
                        </div>
                        <div className="text-sm text-muted-foreground">Weight Change</div>
                      </div>
                    </div>
                  )}

                  {analytics.monthlyData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium mb-4">BMI Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="averageBMI" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {analytics.healthRecommendations && (
                    <div>
                      <h4 className="text-lg font-medium mb-2">Health Recommendations</h4>
                      <div className="space-y-2">
                        {analytics.healthRecommendations.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-secondary/30 rounded">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};