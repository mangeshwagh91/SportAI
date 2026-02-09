import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Trophy, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

interface FitnessGoal {
  _id: string;
  goalType: string;
  targetWeight?: number;
  currentWeight?: number;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  description?: string;
  workoutFrequency: string;
  preferredSports: string[];
  dietaryRestrictions: string[];
  fitnessLevel: string;
  createdAt: string;
  updatedAt: string;
}

export const FitnessGoalsManager = () => {
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FitnessGoal | null>(null);
  
  const [formData, setFormData] = useState({
    goalType: '',
    targetWeight: '',
    targetDate: '',
    description: '',
    workoutFrequency: '3-4_times_week',
    fitnessLevel: 'beginner'
  });

  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchGoals();
    }
  }, [user, token]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setGoals(data.data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const goalData = {
        ...formData,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : undefined,
        targetDate: formData.targetDate || undefined
      };

      const url = editingGoal ? `${API_URL}/goals/${editingGoal._id}` : `${API_URL}/goals`;
      const method = editingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchGoals();
        setIsDialogOpen(false);
        resetForm();
      } else {
        setError(data.message || 'Failed to save goal');
      }

    } catch (error: any) {
      setError('Error saving goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setGoals(goals.filter(goal => goal._id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const updateGoalStatus = async (goalId: string, status: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        await fetchGoals();
      }
    } catch (error) {
      console.error('Error updating goal status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      goalType: '',
      targetWeight: '',
      targetDate: '',
      description: '',
      workoutFrequency: '3-4_times_week',
      fitnessLevel: 'beginner'
    });
    setEditingGoal(null);
    setError(null);
  };

  const openEditDialog = (goal: FitnessGoal) => {
    setEditingGoal(goal);
    setFormData({
      goalType: goal.goalType,
      targetWeight: goal.targetWeight?.toString() || '',
      targetDate: goal.targetDate?.split('T')[0] || '',
      description: goal.description || '',
      workoutFrequency: goal.workoutFrequency,
      fitnessLevel: goal.fitnessLevel
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalTypeColor = (goalType: string) => {
    const colors = {
      weight_loss: 'bg-red-100 text-red-800',
      weight_gain: 'bg-blue-100 text-blue-800',
      muscle_gain: 'bg-purple-100 text-purple-800',
      endurance: 'bg-orange-100 text-orange-800',
      strength: 'bg-yellow-100 text-yellow-800',
      flexibility: 'bg-green-100 text-green-800',
      general_fitness: 'bg-gray-100 text-gray-800'
    };
    return colors[goalType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatGoalType = (goalType: string) => {
    return goalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateProgress = (goal: FitnessGoal) => {
    if (!goal.targetDate) return 0;
    
    const now = new Date();
    const target = new Date(goal.targetDate);
    const created = new Date(goal.createdAt);
    
    const totalDays = Math.ceil((target.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Fitness Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please log in to manage your fitness goals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fitness Goals</h2>
          <p className="text-muted-foreground">
            Set and track your fitness objectives to stay motivated
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={createGoal} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select 
                  value={formData.goalType} 
                  onValueChange={(value) => setFormData({ ...formData, goalType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="70"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    min="20"
                    max="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workoutFrequency">Workout Frequency</Label>
                <Select 
                  value={formData.workoutFrequency} 
                  onValueChange={(value) => setFormData({ ...formData, workoutFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="3-4_times_week">3-4 times per week</SelectItem>
                    <SelectItem value="5-6_times_week">5-6 times per week</SelectItem>
                    <SelectItem value="weekend_only">Weekend only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <Select 
                  value={formData.fitnessLevel} 
                  onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={1000}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Target className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No goals set yet</h3>
                <p className="text-muted-foreground">
                  Create your first fitness goal to start tracking your progress
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge className={getGoalTypeColor(goal.goalType)}>
                      {formatGoalType(goal.goalType)}
                    </Badge>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status === 'active' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {goal.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {goal.status === 'paused' && <Clock className="w-3 h-3 mr-1" />}
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {goal.description}
                  </p>
                )}

                {goal.targetWeight && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target Weight</span>
                    <span className="font-medium">{goal.targetWeight}kg</span>
                  </div>
                )}

                {goal.targetDate && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">
                        {Math.round(calculateProgress(goal))}%
                      </span>
                    </div>
                    <Progress value={calculateProgress(goal)} />
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {getDaysRemaining(goal.targetDate) > 0 
                        ? `${getDaysRemaining(goal.targetDate)} days remaining`
                        : 'Target date passed'
                      }
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span>{goal.workoutFrequency.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{goal.fitnessLevel}</span>
                  </div>
                </div>

                {goal.status === 'active' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalStatus(goal._id, 'completed')}
                      className="flex-1"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalStatus(goal._id, 'paused')}
                      className="flex-1"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  </div>
                )}

                {goal.status === 'paused' && (
                  <Button
                    size="sm"
                    onClick={() => updateGoalStatus(goal._id, 'active')}
                    className="w-full"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Resume Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};