import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Calendar, Ruler, Weight, Target, Save, ArrowLeft, Activity, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserProfile {
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessLevel?: string;
  goals?: string[];
  bio?: string;
  joinedAt: string;
}

interface Exam {
  _id: string;
  examName: string;
  grade: string;
  marks?: number;
  percentage?: number;
  result?: string;
  date: string;
}

interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  exams: Exam[];
}

interface AcademicData {
  _id: string;
  subjects: Subject[];
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    bio: '',
    fitnessLevel: 'beginner'
  });

  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      if (!user.onboardingComplete) {
        navigate('/onboarding');
        return;
      }
      
      setProfile({
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals || [],
        bio: user.bio,
        joinedAt: user.createdAt || new Date().toISOString()
      });

      setEditData({
        name: user.name,
        age: user.age?.toString() || '',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        bio: user.bio || '',
        fitnessLevel: user.fitnessLevel || 'beginner'
      });

      // Fetch academic data
      fetchAcademicData();
    }
  }, [user, navigate]);

  const fetchAcademicData = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/academics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAcademicData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch academic data:', error);
    }
  };

  const handleSave = async () => {
    if (!token || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          age: editData.age ? parseInt(editData.age) : undefined,
          height: editData.height ? parseFloat(editData.height) : undefined,
          weight: editData.weight ? parseFloat(editData.weight) : undefined,
          bio: editData.bio,
          fitnessLevel: editData.fitnessLevel
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local user state
        updateUser(data.data.user);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setError('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getFitnessLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt={profile.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getUserInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                
                {profile.fitnessLevel && (
                  <div className="flex justify-center mt-2">
                    <Badge className={getFitnessLevelColor(profile.fitnessLevel)}>
                      {profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)} Level
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {profile.bio && (
                    <div>
                      <p className="text-sm">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {profile.height && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-lg font-semibold">{profile.height} cm</div>
                        <div className="text-xs text-muted-foreground">Height</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profile.weight && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-lg font-semibold">{profile.weight} kg</div>
                        <div className="text-xs text-muted-foreground">Weight</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Edit Form / Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {isEditing ? 'Edit Profile Information' : 'Profile Information'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your personal information and fitness details' : 'Your personal information and fitness details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={editData.age}
                          onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                          placeholder="Enter your age"
                          min="10"
                          max="150"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={editData.height}
                          onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                          placeholder="Enter your height in cm"
                          min="50"
                          max="300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={editData.weight}
                          onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                          placeholder="Enter your weight in kg"
                          min="20"
                          max="500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fitnessLevel">Fitness Level</Label>
                      <select
                        id="fitnessLevel"
                        value={editData.fitnessLevel}
                        onChange={(e) => setEditData({ ...editData, fitnessLevel: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us a bit about yourself and your fitness journey..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {editData.bio.length}/500 characters
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="text-sm">{profile.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <p className="text-sm">{profile.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                          <p className="text-sm">{profile.age ? `${profile.age} years old` : 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Height</Label>
                          <p className="text-sm">{profile.height ? `${profile.height} cm` : 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                          <p className="text-sm">{profile.weight ? `${profile.weight} kg` : 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Fitness Level</Label>
                          <p className="text-sm">{profile.fitnessLevel ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) : 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                          <p className="text-sm mt-1">{profile.bio}</p>
                        </div>
                      </>
                    )}

                    {profile.goals && profile.goals.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Fitness Goals</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profile.goals.map((goal, index) => (
                              <Badge key={index} variant="secondary">
                                <Target className="w-3 h-3 mr-1" />
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Academic Performance Section */}
        {academicData && academicData.subjects.some(s => s.exams.length > 0) && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Academic Performance
                </CardTitle>
                <CardDescription>
                  Overview of your test performance and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Tests</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {academicData.subjects.reduce((sum, s) => sum + s.exams.length, 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Excellent Grades</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {academicData.subjects.reduce((sum, s) => 
                        sum + s.exams.filter(e => e.grade === 'EX').length, 0
                      )}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Active Subjects</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {academicData.subjects.filter(s => s.exams.length > 0).length}
                    </p>
                  </div>
                </div>

                {/* Performance Over Time Graph */}
                {academicData.subjects.some(s => s.exams.length > 0) && (
                  <div>
                    <h4 className="text-sm font-medium mb-4">Performance Over Time</h4>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={(() => {
                            // Map grades to numeric values for chart positioning (internal use only)
                            const gradeToPosition = (grade: string) => {
                              switch (grade) {
                                case 'EX': return 3;
                                case 'G': return 2;
                                case 'S': return 1;
                                default: return 0;
                              }
                            };

                            return academicData.subjects
                              .flatMap(subject => 
                                subject.exams
                                  .filter(exam => exam.grade) // Only include exams with grades
                                  .map(exam => ({
                                    date: new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    fullDate: new Date(exam.date).toLocaleDateString(),
                                    timestamp: new Date(exam.date).getTime(),
                                    gradePosition: gradeToPosition(exam.grade || ''),
                                    subject: subject.subjectName,
                                    examName: exam.examName,
                                    grade: exam.grade,
                                  }))
                              )
                              .sort((a, b) => a.timestamp - b.timestamp)
                              .slice(-10); // Last 10 tests
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            domain={[0, 4]} 
                            label={{ value: 'Grade', angle: -90, position: 'insideLeft' }}
                            ticks={[1, 2, 3]}
                            tickFormatter={(value) => {
                              switch(value) {
                                case 3: return 'EX';
                                case 2: return 'G';
                                case 1: return 'S';
                                default: return '';
                              }
                            }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                                    <p className="font-medium">{data.subject}</p>
                                    <p className="text-sm">{data.examName}</p>
                                    <p className="text-sm">Date: {data.fullDate}</p>
                                    <p className="text-sm font-semibold">Grade: {data.grade}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="gradePosition" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            name="Grade"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing last 10 tests across all subjects
                    </p>
                  </div>
                )}

                {/* Subject-wise summary */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Subject Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {academicData.subjects.filter(s => s.exams.length > 0).map((subject) => {
                      const isFiringTest = subject.subjectName === 'Firing Test 5 bullets';
                      const exCount = subject.exams.filter(e => e.grade === 'EX').length;
                      const gCount = subject.exams.filter(e => e.grade === 'G').length;
                      const sCount = subject.exams.filter(e => e.grade === 'S').length;
                      const avgMarks = isFiringTest 
                        ? subject.exams.filter(e => e.marks).reduce((sum, e) => sum + (e.marks || 0), 0) / subject.exams.filter(e => e.marks).length
                        : 0;
                      
                      return (
                        <div key={subject._id} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">{subject.subjectName}</h5>
                          <p className="text-xs text-muted-foreground mb-3">
                            {subject.exams.length} test{subject.exams.length !== 1 ? 's' : ''}
                          </p>
                          {isFiringTest ? (
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                Avg: {avgMarks.toFixed(1)}/50
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {exCount > 0 && (
                                <Badge variant="default" className="bg-green-600">
                                  {exCount} EX
                                </Badge>
                              )}
                              {gCount > 0 && (
                                <Badge variant="secondary">
                                  {gCount} G
                                </Badge>
                              )}
                              {sCount > 0 && (
                                <Badge variant="outline">
                                  {sCount} S
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Link to full academics page */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/academics')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Full Academic Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;