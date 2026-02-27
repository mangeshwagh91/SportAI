import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { BookOpen, Plus, Trash2, TrendingUp, Award, ArrowLeft, BarChart3 } from 'lucide-react';
import { API_URL } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

interface Exam {
  _id: string;
  examName: string;
  grade: string;
  marks?: number;
  maxMarks?: number;
  percentage?: number;
  result?: string; // Pass or Fail for Test-1
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

const Academics = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Form states
  const [examName, setExamName] = useState('');
  const [grade, setGrade] = useState('');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('50');
  const [result, setResult] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check if user has completed onboarding
    if (user && !user.onboardingComplete) {
      navigate('/onboarding');
      return;
    }
    if (!user) {
      navigate('/');
      return;
    }
    fetchAcademicData();
  }, [user, navigate]);

  const fetchAcademicData = async () => {
    try {
      const response = await fetch(`${API_URL}/academics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch academic data');
      }

      const data = await response.json();
      setAcademicData(data.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExam = async () => {
    // Validate required fields based on subject type
    if (!selectedSubject || !examName) {
      setError('Please fill in all required fields');
      return;
    }

    // For non-Firing Test subjects, grade is required
    if (selectedSubject.subjectName !== 'Firing Test 5 bullets' && !grade) {
      alert('Please select a grade');
      return;
    }

    // For Test-1, result is required
    if (examName === 'Test-1' && !result) {
      alert('Please select Pass or Fail result for Test-1');
      return;
    }

    // For Firing Test, marks are required
    if (selectedSubject.subjectName === 'Firing Test 5 bullets' && !marks) {
      alert('Please enter marks for Firing Test (out of 50)');
      return;
    }

    // Validate Test-2 submission - only allowed if Test-1 was failed (grade G or S)
    if (examName === 'Test-2') {
      const test1 = selectedSubject.exams.find(exam => exam.examName === 'Test-1');
      if (!test1) {
        alert('You must complete Test-1 before submitting Test-2');
        return;
      }
      if (test1.grade === 'EX') {
        alert('Test-2 is only allowed if you did not get Excellent in Test-1');
        return;
      }
    }

    // Prevent duplicate exam names
    const existingExam = selectedSubject.exams.find(exam => exam.examName === examName);
    if (existingExam) {
      alert(`${examName} has already been submitted. Please delete it first if you want to resubmit.`);
      return;
    }

    try {
      const requestBody: any = {
        examName,
        date: examDate,
      };

      // Add grade only for non-Firing Test subjects
      if (selectedSubject.subjectName !== 'Firing Test 5 bullets') {
        requestBody.grade = grade;
      }

      // Add result for Test-1
      if (examName === 'Test-1') {
        requestBody.result = result;
      }

      // Add marks only for Firing Test 5 bullets
      if (selectedSubject.subjectName === 'Firing Test 5 bullets' && marks) {
        requestBody.marks = parseFloat(marks);
        requestBody.maxMarks = 50;
      }

      const response = await fetch(
        `${API_URL}/academics/subjects/${selectedSubject.subjectCode}/exams`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add test grade');
      }

      const data = await response.json();
      setAcademicData(data.data);
      setSuccess(`${examName} added successfully!`);
      setIsAddExamDialogOpen(false);
      resetForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteExam = async (subjectCode: string, examId: string) => {
    if (!confirm('Are you sure you want to delete this test grade?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/academics/subjects/${subjectCode}/exams/${examId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete test grade');
      }

      const data = await response.json();
      setAcademicData(data.data);
      setSuccess('Test grade deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setExamName('');
    setGrade('');
    setMarks('');
    setMaxMarks('50');
    setResult('');
    setExamDate(new Date().toISOString().split('T')[0]);
  };

  const openAddExamDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    resetForm();
    setIsAddExamDialogOpen(true);
  };

  const getGradeLabel = (g: string) => {
    if (g === 'EX') return 'Excellent';
    if (g === 'G') return 'Good';
    if (g === 'S') return 'Satisfactory';
    return g;
  };

  const getGradeVariant = (g: string): "default" | "secondary" | "outline" | "destructive" => {
    if (g === 'EX') return 'default';
    if (g === 'G') return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading academic records...</p>
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
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Academic Records</h1>
                <p className="text-sm text-muted-foreground">Track your Physical Training test performance</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="w-3 h-3" />
              Academics
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

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Overall Stats */}
        {academicData && academicData.subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Total Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{academicData.subjects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Tests Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {academicData.subjects.reduce((sum, s) => sum + s.exams.length, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for Records and Performance */}
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Test Records
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Analysis
            </TabsTrigger>
          </TabsList>

          {/* Records Tab */}
          <TabsContent value="records">
            <div className="space-y-6">
              {academicData && academicData.subjects.length > 0 ? (
            academicData.subjects.map((subject) => (
              <Card key={subject._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {subject.subjectName}
                      </CardTitle>
                      <CardDescription>
                        Code: {subject.subjectCode}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => openAddExamDialog(subject)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Grade
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subject.exams.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Grade</TableHead>
                          {subject.subjectName === 'Firing Test 5 bullets' && (
                            <TableHead>Marks</TableHead>
                          )}
                          <TableHead>Result</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subject.exams.map((exam) => (
                          <TableRow key={exam._id}>
                            <TableCell className="font-medium">{exam.examName}</TableCell>
                            <TableCell>
                              {exam.grade ? (
                                <Badge variant={getGradeVariant(exam.grade)}>
                                  {exam.grade} - {getGradeLabel(exam.grade)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            {subject.subjectName === 'Firing Test 5 bullets' && (
                              <TableCell>
                                <Badge variant="outline">
                                  {exam.marks !== undefined ? `${exam.marks}/50` : 'N/A'}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>
                              {exam.examName === 'Test-1' && exam.result ? (
                                <Badge variant={exam.result === 'Pass' ? 'default' : 'destructive'}>
                                  {exam.result}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(exam.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExam(subject.subjectCode, exam._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No test results yet. Click "Add Grade" to add your test grades.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Academic Subjects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your Academic subjects will appear here once they are set up.
                </p>
              </CardContent>
            </Card>
          )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            {academicData && academicData.subjects.length > 0 && academicData.subjects.some(s => s.exams.length > 0) ? (
              <div className="space-y-6">
                {/* Performance graphs for each subject */}
                {academicData.subjects.filter(s => s.exams.length > 0).map((subject) => {
                  const isFiringTest = subject.subjectName === 'Firing Test 5 bullets';
                  
                  // Map grades to numeric values for chart positioning (internal use only)
                  const gradeToPosition = (grade: string) => {
                    switch (grade) {
                      case 'EX': return 3;
                      case 'G': return 2;
                      case 'S': return 1;
                      default: return 0;
                    }
                  };

                  // Prepare data for performance over time chart
                  const performanceData = subject.exams
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((exam, index) => ({
                      testNumber: index + 1,
                      date: new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      fullDate: new Date(exam.date).toLocaleDateString(),
                      gradePosition: exam.grade ? gradeToPosition(exam.grade) : 0,
                      grade: exam.grade,
                      marks: exam.marks,
                      maxMarks: exam.maxMarks || 50,
                      examName: exam.examName,
                    }));

                  return (
                    <Card key={subject.subjectCode}>
                      <CardHeader>
                        <CardTitle>{subject.subjectName}</CardTitle>
                        <CardDescription>Performance analysis for {subject.exams.length} tests</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Performance vs Time Line Chart */}
                        <div>
                          <h4 className="text-sm font-medium mb-4">Performance Over Time</h4>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                                />
                                {isFiringTest ? (
                                  <YAxis 
                                    domain={[0, 50]} 
                                    label={{ value: 'Marks', angle: -90, position: 'insideLeft' }}
                                  />
                                ) : (
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
                                )}
                                <Tooltip 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                                          <p className="font-medium">{data.examName}</p>
                                          <p className="text-sm">Date: {data.fullDate}</p>
                                          {isFiringTest ? (
                                            <p className="text-sm font-semibold">Marks: {data.marks}/{data.maxMarks}</p>
                                          ) : (
                                            <p className="text-sm font-semibold">Grade: {data.grade}</p>
                                          )}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey={isFiringTest ? "marks" : "gradePosition"}
                                  stroke="#3b82f6" 
                                  strokeWidth={3}
                                  dot={{ fill: '#3b82f6', r: 6 }}
                                  name={isFiringTest ? "Marks" : "Grade"}
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Performance Data Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add test grades to see your performance analysis and progress graphs.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Exam Dialog */}
      <Dialog open={isAddExamDialogOpen} onOpenChange={setIsAddExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Grade</DialogTitle>
            <DialogDescription>
              Add your test grade for {selectedSubject?.subjectName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="examName">Test Name <span className="text-red-500">*</span></Label>
              <Select value={examName} onValueChange={setExamName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubject?.subjectName === 'Firing Test 5 bullets' ? (
                    <>
                      <SelectItem value="Practice-1">Practice-1</SelectItem>
                      <SelectItem value="Practice-2">Practice-2</SelectItem>
                      <SelectItem value="Practice-3">Practice-3</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Screening-1">Screening-1</SelectItem>
                      <SelectItem value="Screening-2">Screening-2</SelectItem>
                      <SelectItem value="Test-1">Test-1</SelectItem>
                      <SelectItem 
                        value="Test-2" 
                        disabled={!selectedSubject?.exams.find(e => e.examName === 'Test-1' && e.grade !== 'EX')}
                      >
                        Test-2 {selectedSubject?.exams.find(e => e.examName === 'Test-1' && e.grade !== 'EX') ? '' : '(Complete Test-1 without EX first)'}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedSubject?.subjectName === 'Firing Test 5 bullets' 
                  ? 'Select practice session or final test'
                  : 'Test-2 is only available if Test-1 grade is not Excellent'}
              </p>
            </div>
            {examName === 'Test-1' && (
              <div className="grid gap-2">
                <Label htmlFor="result">Result <span className="text-red-500">*</span></Label>
                <Select value={result} onValueChange={setResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select whether you passed or failed Test-1</p>
              </div>
            )}
            {selectedSubject?.subjectName !== 'Firing Test 5 bullets' && (
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade <span className="text-red-500">*</span></Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EX">EX - Excellent</SelectItem>
                    <SelectItem value="G">G - Good</SelectItem>
                    <SelectItem value="S">S - Satisfactory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedSubject?.subjectName === 'Firing Test 5 bullets' && (
              <div className="grid gap-2">
                <Label htmlFor="marks">Marks (Required) <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    id="marks"
                    type="number"
                    placeholder="Marks obtained"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    min="0"
                    max="50"
                    required
                  />
                  <span className="flex items-center px-2">/</span>
                  <Input
                    id="maxMarks"
                    type="number"
                    value="50"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter marks out of 50 for Firing Test</p>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="examDate">Test Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExam}>Add Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Academics;
