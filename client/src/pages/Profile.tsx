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
import { User, Mail, Calendar, Ruler, Weight, Target, Save, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

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

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
    }
  }, [user]);

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
      </div>
    </div>
  );
};

export default Profile;