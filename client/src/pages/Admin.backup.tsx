import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Activity,
  ArrowLeft,
  Trash2,
  Shield,
  Eye,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config/api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  onboardingComplete: boolean;
  createdAt: string;
  age?: number;
  bmi?: number;
  favouriteSport?: string;
  playingSport?: boolean;
  fitnessLevel?: string;
  gender?: string;
  height?: number;
  weight?: number;
}

interface Exam {
  _id: string;
  examName: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  date: string;
}

interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  exams: Exam[];
  currentGrade?: string;
  averageScore?: number;
}

interface AcademicData {
  _id: string;
  subjects: Subject[];
  academicYear?: string;
  semester?: string;
  overallPercentage?: number;
}

interface UserDetails {
  user: UserData;
  academics?: AcademicData;
}

interface Stats {
  totalUsers: number;
  completedOnboarding: number;
  pendingOnboarding: number;
  adminUsers: number;
}

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    completedOnboarding: 0,
    pendingOnboarding: 0,
    adminUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      const usersList = data.data?.users || data.users || [];
      setUsers(usersList);
      
      // Calculate stats
      const totalUsers = usersList.length;
      const completedOnboarding = usersList.filter((u: UserData) => u.onboardingComplete).length;
      const pendingOnboarding = totalUsers - completedOnboarding;
      const adminUsers = usersList.filter((u: UserData) => u.role === 'admin').length;
      
      setStats({
        totalUsers,
        completedOnboarding,
        pendingOnboarding,
        adminUsers,
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    setIsDetailsDialogOpen(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setSelectedUserDetails(data.data);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsDetailsDialogOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">User Management</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Completed Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedOnboarding}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Pending Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingOnboarding}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.adminUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage all registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((userData) => (
                      <TableRow key={userData._id}>
                        <TableCell className="font-medium">{userData.name}</TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>
                          <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                            {userData.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{userData.age || 'N/A'}</TableCell>
                        <TableCell>
                          {userData.bmi ? (
                            <Badge variant="outline">{userData.bmi.toFixed(1)}</Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {userData.favouriteSport || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchUserDetails(userData._id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(userData._id)}
                              disabled={userData._id === user?._id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete profile and academic information
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-12 text-center">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          ) : selectedUserDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedUserDetails.user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedUserDetails.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Age</Label>
                    <p className="font-medium">{selectedUserDetails.user.age || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Gender</Label>
                    <p className="font-medium capitalize">{selectedUserDetails.user.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">BMI</Label>
                    <p className="font-medium">{selectedUserDetails.user.bmi?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Favourite Sport</Label>
                    <p className="font-medium">{selectedUserDetails.user.favouriteSport || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Currently Playing Sport</Label>
                    <p className="font-medium">
                      {selectedUserDetails.user.playingSport ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Fitness Level</Label>
                    <p className="font-medium capitalize">{selectedUserDetails.user.fitnessLevel || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Performance */}
              {selectedUserDetails.academics && selectedUserDetails.academics.subjects.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Academic Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <Label className="text-sm text-muted-foreground">Total Subjects</Label>
                          <p className="text-2xl font-bold">{selectedUserDetails.academics.subjects.length}</p>
                        </div>
                        <div className="text-center">
                          <Label className="text-sm text-muted-foreground">Overall Percentage</Label>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedUserDetails.academics.overallPercentage?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        <div className="text-center">
                          <Label className="text-sm text-muted-foreground">Average Grade</Label>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedUserDetails.academics.overallPercentage && selectedUserDetails.academics.overallPercentage >= 90 ? 'A+' :
                             selectedUserDetails.academics.overallPercentage && selectedUserDetails.academics.overallPercentage >= 80 ? 'A' :
                             selectedUserDetails.academics.overallPercentage && selectedUserDetails.academics.overallPercentage >= 70 ? 'B' :
                             selectedUserDetails.academics.overallPercentage && selectedUserDetails.academics.overallPercentage >= 60 ? 'C' :
                             selectedUserDetails.academics.overallPercentage && selectedUserDetails.academics.overallPercentage >= 50 ? 'D' : 'F'}
                          </p>
                        </div>
                      </div>

                      {/* Subject-wise performance */}
                      <div className="space-y-4">
                        {selectedUserDetails.academics.subjects.map((subject) => (
                          <div key={subject._id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold">{subject.subjectName}</h4>
                                <p className="text-sm text-muted-foreground">Code: {subject.subjectCode}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-lg">{subject.currentGrade || 'N/A'}</Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Avg: {subject.averageScore?.toFixed(1) || '0.0'}%
                                </p>
                              </div>
                            </div>

                            {/* Progress Graph */}
                            {subject.exams.length > 0 && (
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={subject.exams.map(exam => ({
                                    name: exam.examName,
                                    percentage: exam.percentage,
                                    date: new Date(exam.date).toLocaleDateString()
                                  }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                      type="monotone" 
                                      dataKey="percentage" 
                                      stroke="#3b82f6" 
                                      strokeWidth={2}
                                      name="Score (%)"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}

                            {/* Exam Details Table */}
                            <Table className="mt-4">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Exam</TableHead>
                                  <TableHead>Marks</TableHead>
                                  <TableHead>Percentage</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {subject.exams.map((exam) => (
                                  <TableRow key={exam._id}>
                                    <TableCell className="font-medium">{exam.examName}</TableCell>
                                    <TableCell>{exam.marks} / {exam.maxMarks}</TableCell>
                                    <TableCell>
                                      <Badge variant={exam.percentage >= 80 ? 'default' : exam.percentage >= 60 ? 'secondary' : 'destructive'}>
                                        {exam.percentage.toFixed(1)}%
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No academic records available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
