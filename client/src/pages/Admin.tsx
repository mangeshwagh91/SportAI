import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
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
  CheckCircle,
  XCircle,
  Search,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config/api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  chNo?: string;
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
  stressAssessment?: {
    stressLevel?: string;
    totalScore?: number;
  };
}

interface AcademicData {
  subjects: {
    subjectName: string;
    subjectCode: string;
    exams: {
      examName: string;
      grade: string;
      marks?: number;
      maxMarks?: number;
      percentage?: number;
      result?: string;
      date: string;
    }[];
  }[];
}

interface UserDetailsData {
  user: UserData;
  academics: AcademicData | null;
}

interface NCCCadet {
  _id: string;
  chNo: string;
  fullName: string;
  rank: string;
  nccNo: string;
  company: string;
  mobile: string;
  email: string;
  wing: string;
  bloodGrp: string;
  signedUp: boolean;
  userId?: {
    _id: string;
    name: string;
    email: string;
    onboardingComplete: boolean;
  };
}

interface Stats {
  totalUsers: number;
  completedOnboarding: number;
  pendingOnboarding: number;
  adminUsers: number;
}

interface NCCStats {
  total: number;
  signedUp: number;
  notSignedUp: number;
}

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [nccCadets, setNCCCadets] = useState<NCCCadet[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    completedOnboarding: 0,
    pendingOnboarding: 0,
    adminUsers: 0,
  });
  const [nccStats, setNCCStats] = useState<NCCStats>({
    total: 0,
    signedUp: 0,
    notSignedUp: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [signupFilter, setSignupFilter] = useState<string>('all');
  const [hoveredUserDetails, setHoveredUserDetails] = useState<UserDetailsData | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchNCCCadets();
  }, [user, navigate]);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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

  const fetchNCCCadets = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/ncc-cadets?limit=500`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch NCC cadets');
      }

      const data = await response.json();
      setNCCCadets(data.data.cadets || []);
      setNCCStats(data.data.stats || { total: 0, signedUp: 0, notSignedUp: 0 });
    } catch (error: any) {
      console.error('Error fetching NCC cadets:', error);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingUserDetails(true);
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
      setHoveredUserDetails(data.data);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingUserDetails(false);
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

  const filteredNCCCadets = nccCadets.filter(cadet => {
    const matchesSearch = 
      cadet.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cadet.chNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cadet.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      signupFilter === 'all' ||
      (signupFilter === 'signed-up' && cadet.signedUp) ||
      (signupFilter === 'not-signed-up' && !cadet.signedUp);
    
    return matchesSearch && matchesFilter;
  });

  // Render user details popover content
  const renderUserDetailsPopover = () => {
    console.log('renderUserDetailsPopover called. loadingUserDetails:', loadingUserDetails, 'hoveredUserDetails:', hoveredUserDetails);
    
    if (loadingUserDetails) {
      return (
        <div className="w-[520px] p-6 select-none">
          <Activity className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-center text-sm text-muted-foreground mt-2">Loading...</p>
        </div>
      );
    }

    if (!hoveredUserDetails) {
      return (
        <div className="w-[520px] p-6 select-none">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      );
    }

    const { user: userDetails, academics } = hoveredUserDetails;

    // Prepare multi-line chart data
    const gradeToPosition = (grade: string) => {
      switch (grade) {
        case 'EX': return 3;
        case 'G': return 2;
        case 'S': return 1;
        default: return 0;
      }
    };

    // Create a unified timeline with all subjects
    let chartData: any[] = [];
    const subjectColors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // violet
      '#ec4899', // pink
    ];

    if (academics && academics.subjects.length > 0) {
      // Collect all exams with their dates, subjects, grades, and marks
      const allExams: { 
        date: Date; 
        dateKey: string; 
        subject: string; 
        grade: string;
        marks?: number;
        maxMarks?: number;
      }[] = [];
      
      academics.subjects.forEach(subject => {
        subject.exams.forEach(exam => {
          const examDate = new Date(exam.date);
          allExams.push({
            date: examDate,
            dateKey: examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
            subject: subject.subjectName,
            grade: exam.grade || '',
            marks: exam.marks,
            maxMarks: exam.maxMarks
          });
        });
      });

      // Sort by date
      allExams.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Group by date and build chart data
      const dateMap = new Map<string, any>();
      
      allExams.forEach(exam => {
        if (!dateMap.has(exam.dateKey)) {
          dateMap.set(exam.dateKey, { date: exam.dateKey });
        }
        const dataPoint = dateMap.get(exam.dateKey);
        
        // For Firing Test (no grade), use marks; for others use grade position
        if (exam.subject === 'Firing Test 5 bullets' && exam.marks !== undefined) {
          // Normalize marks to 0-3 scale to match grade positions (0-50 -> 0-3)
          dataPoint[exam.subject] = (exam.marks / 50) * 3;
          dataPoint[`${exam.subject}_marks`] = exam.marks;
          dataPoint[`${exam.subject}_maxMarks`] = exam.maxMarks;
        } else if (exam.grade) {
          dataPoint[exam.subject] = gradeToPosition(exam.grade);
        }
      });

      chartData = Array.from(dateMap.values());
    }

    return (
      <div className="w-[520px] p-6 max-h-[600px] overflow-y-auto select-none">
        <h3 className="font-semibold text-lg mb-4">{userDetails.name}</h3>
        
        {/* User Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="font-medium">{userDetails.age || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="font-medium">{userDetails.height ? `${userDetails.height} cm` : 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">BMI</p>
            <p className="font-medium">{userDetails.bmi ? userDetails.bmi.toFixed(1) : 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Stress Level</p>
            <Badge variant={
              userDetails.stressAssessment?.stressLevel === 'high' ? 'destructive' :
              userDetails.stressAssessment?.stressLevel === 'moderate' ? 'default' :
              userDetails.stressAssessment?.stressLevel === 'mild' ? 'secondary' :
              'outline'
            }>
              {userDetails.stressAssessment?.stressLevel || 'N/A'}
            </Badge>
          </div>
        </div>

        {/* Performance Graph */}
        {academics && academics.subjects.length > 0 && chartData.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" />
              <h4 className="font-medium text-sm">Performance Graph</h4>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 4]} 
                    ticks={[1, 2, 3]}
                    tick={{ fontSize: 11 }}
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
                          <div className="bg-white p-2 border rounded shadow-lg text-xs">
                            <p className="font-medium mb-1">{data.date}</p>
                            {payload.map((entry: any, index: number) => {
                              const subjectName = entry.name;
                              const marksKey = `${subjectName}_marks`;
                              const maxMarksKey = `${subjectName}_maxMarks`;
                              const hasMarks = data[marksKey] !== undefined;
                              const isFiringTest = subjectName === 'Firing Test 5 bullets';
                              
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span>{subjectName}:</span>
                                  <span className="font-medium">
                                    {isFiringTest && hasMarks ? (
                                      `${data[marksKey]}/${data[maxMarksKey]}`
                                    ) : (
                                      <>
                                        {entry.value === 3 ? 'EX' : entry.value === 2 ? 'G' : entry.value === 1 ? 'S' : 'N/A'}
                                      </>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {academics.subjects.map((subject, index) => (
                    <Line
                      key={subject.subjectCode}
                      type="monotone"
                      dataKey={subject.subjectName}
                      stroke={subjectColors[index % subjectColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={subject.subjectName}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center select-none">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No academic data available</p>
          </div>
        )}
      </div>
    );
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
                <p className="text-sm text-muted-foreground">User & NCC Cadet Management (Chest Number Tracking)</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="users">Users ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="ncc-cadets">NCC Cadets ({nccStats.total})</TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <TableHead>Chest No</TableHead>
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
                          <Popover 
                            key={userData._id}
                            open={hoveredUserId === userData._id}
                            onOpenChange={(open) => {
                              console.log(`Popover ${userData._id} open state changed to:`, open);
                              if (!open) {
                                setHoveredUserId(null);
                                setHoveredUserDetails(null);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <TableRow 
                                className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                                onMouseEnter={() => {
                                  console.log('Mouse entered row for user:', userData._id);
                                  // Clear any pending close timeout
                                  if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                  }
                                  setHoveredUserId(userData._id);
                                  console.log('Set hoveredUserId to:', userData._id);
                                  fetchUserDetails(userData._id);
                                }}
                                onMouseLeave={() => {
                                  console.log('Mouse left row');
                                  // Delay closing to allow moving to popover
                                  hoverTimeoutRef.current = setTimeout(() => {
                                    setHoveredUserId(null);
                                    setHoveredUserDetails(null);
                                  }, 500);
                                }}
                              >
                                <TableCell className="font-medium">{userData.name}</TableCell>
                                <TableCell>{userData.email}</TableCell>
                                <TableCell>
                                  {userData.chNo ? (
                                    <Badge variant="outline">{userData.chNo}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">N/A</span>
                                  )}
                                </TableCell>
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUser(userData._id);
                                      }}
                                      disabled={userData._id === user?._id}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </PopoverTrigger>
                            <PopoverContent 
                              side="top" 
                              align="start"
                              className="w-auto max-w-[580px] p-0 z-50 border border-border shadow-xl rounded-xl bg-popover"
                              sideOffset={10}
                              onMouseEnter={() => {
                                // Clear any pending close timeout
                                if (hoverTimeoutRef.current) {
                                  clearTimeout(hoverTimeoutRef.current);
                                  hoverTimeoutRef.current = null;
                                }
                                setHoveredUserId(userData._id);
                              }}
                              onMouseLeave={() => {
                                hoverTimeoutRef.current = setTimeout(() => {
                                  setHoveredUserId(null);
                                  setHoveredUserDetails(null);
                                }, 300);
                              }}
                            >
                              {renderUserDetailsPopover()}
                            </PopoverContent>
                          </Popover>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NCC CADETS TAB */}
          <TabsContent value="ncc-cadets" className="space-y-6">
            {/* NCC Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Cadets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{nccStats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Signed Up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{nccStats.signedUp}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {nccStats.total > 0 ? Math.round((nccStats.signedUp / nccStats.total) * 100) : 0}% completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Not Signed Up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{nccStats.notSignedUp}</div>
                </CardContent>
              </Card>
            </div>

            {/* NCC Cadets Table */}
            <Card>
              <CardHeader>
                <CardTitle>NCC Cadets</CardTitle>
                <CardDescription>
                  View all NCC cadets and their signup status
                </CardDescription>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, Chest Number, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={signupFilter}
                    onChange={(e) => setSignupFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Cadets</option>
                    <option value="signed-up">Signed Up</option>
                    <option value="not-signed-up">Not Signed Up</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chest No</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Wing</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>User Account</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNCCCadets.length > 0 ? (
                        filteredNCCCadets.map((cadet) => (
                          <TableRow key={cadet._id}>
                            <TableCell className="font-medium">{cadet.chNo}</TableCell>
                            <TableCell>{cadet.fullName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cadet.rank || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>{cadet.company || 'N/A'}</TableCell>
                            <TableCell>{cadet.wing || 'N/A'}</TableCell>
                            <TableCell>{cadet.mobile || 'N/A'}</TableCell>
                            <TableCell className="text-sm">{cadet.email || 'N/A'}</TableCell>
                            <TableCell>
                              {cadet.signedUp ? (
                                <Badge className="bg-green-500 hover:bg-green-600 transition-colors duration-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Signed Up
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Not Signed Up
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {cadet.userId ? (
                                <div className="text-sm">
                                  <p className="font-medium">{cadet.userId.name}</p>
                                  <p className="text-muted-foreground text-xs">{cadet.userId.email}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No cadets found matching your search
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
