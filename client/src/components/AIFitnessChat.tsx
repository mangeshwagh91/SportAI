import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Activity, 
  Clock,
  Plus,
  Trash2,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    content: string;
    role: string;
    timestamp: string;
  };
  messageCount: number;
  userContext: {
    bmi?: number;
    age?: number;
    fitnessLevel?: string;
    goals?: string[];
    lastBMICategory?: string;
  };
}

export const AIFitnessChat = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchChatSessions();
    }
  }, [user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentSessionId(data.data.sessionId);
        setMessages(data.data.messages);
        await fetchChatSessions();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to start new chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/chat/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentSessionId(sessionId);
        setMessages(data.data.messages);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSessionId || isLoading) return;

    const message = newMessage.trim();
    setNewMessage('');
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/chat/${currentSessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update with actual messages from server
        setMessages(data.data.allMessages);
        await fetchChatSessions(); // Refresh session list
      } else {
        setError(data.message);
        // Remove the optimistic user message on error
        setMessages(prev => prev.slice(0, -1));
      }
    } catch (error) {
      setError('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, show status text
        setError(`Server error: ${response.status} ${response.statusText}`);
        return;
      }

      if (response.ok && data.success) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
      } else {
        setError(data.message || 'Failed to delete session');
      }
    } catch (error) {
      setError('Network or server error while deleting session');
      console.error('Error deleting session:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatContext = (context: ChatSession['userContext']) => {
    const parts = [];
    if (context.bmi) parts.push(`BMI: ${context.bmi}`);
    if (context.lastBMICategory) parts.push(context.lastBMICategory);
    if (context.fitnessLevel) parts.push(context.fitnessLevel);
    return parts.join(' • ');
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Fitness Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please log in to chat with your AI fitness coach.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Chat Sessions
              <Button 
                size="sm" 
                onClick={startNewSession}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No chat sessions yet
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                        currentSessionId === session.sessionId
                          ? 'bg-primary/10 border-primary/20 border'
                          : 'bg-secondary/50 hover:bg-secondary/70'
                      }`}
                      onClick={() => loadChatSession(session.sessionId)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {session.messageCount} messages
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.sessionId);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs line-clamp-2">
                          {session.lastMessage?.content || 'New conversation'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                        {session.userContext && (
                          <p className="text-xs text-muted-foreground">
                            {formatContext(session.userContext)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Fitness Coach
              {currentSessionId && (
                <Badge variant="outline" className="ml-auto">
                  Active Session
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          {error && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {!currentSessionId ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Welcome to your AI Fitness Coach!</h3>
                  <p className="text-muted-foreground">
                    Start a new conversation to get personalized fitness advice
                  </p>
                </div>
                <Button onClick={startNewSession} disabled={isLoading}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-6">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className={`flex-1 space-y-1 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-secondary">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="inline-block p-3 rounded-lg bg-secondary">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              <div className="p-6 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about workouts, nutrition, or sports recommendations..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
    </div>
  );
};