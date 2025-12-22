import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import Footer from '@/components/Footer';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onBack: () => void;
  onSuccess: () => void;
}

const AuthPage = ({ mode: initialMode, onBack, onSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Clear errors when switching modes
    setError('');
  }, [mode, showForgotPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const redirectUrl = `${window.location.origin}/`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please try signing in instead.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account before signing in.",
          });
          // Don't call onSuccess here, user needs to verify email first
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in to SmartEats.",
          });
          onSuccess();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
        toast({
          title: "Reset email sent",
          description: "Please check your email for password reset instructions.",
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between w-full mb-8 px-2">
      <Button
        variant="ghost"
        size="sm"
        className="group text-muted-foreground hover:text-foreground transition-colors"
        onClick={showForgotPassword ? () => setShowForgotPassword(false) : onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        {showForgotPassword ? 'Back to Login' : 'Back'}
      </Button>
      <ThemeToggle />
    </div>
  );

  if (showForgotPassword) {
    return (
      <div className="min-h-[100dvh] bg-background/50 flex flex-col items-center animate-fade-in text-foreground overflow-y-auto overflow-x-hidden">
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md my-auto">
            {renderHeader()}
            <Card className="glass border-border/50 overflow-hidden">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription className="text-base">
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetEmailSent ? (
                  <Alert className="bg-cta/10 border-cta/20">
                    <Mail className="h-5 w-5 text-cta" />
                    <AlertDescription className="text-sm font-medium">
                      Reset link sent! Please check your inbox and follow the instructions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cta transition-colors" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-12 bg-background/50 border-border/50 focus:border-cta focus:ring-cta/20 transition-all text-base"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold cta-gradient hover:opacity-90 transition-opacity"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background/50 flex flex-col items-center animate-fade-in text-foreground overflow-y-auto overflow-x-hidden">
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md my-auto">
          {renderHeader()}
          <Card className="glass border-border/50 overflow-hidden shadow-2xl">
            <CardHeader className="space-y-2 pb-6 text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                {mode === 'login'
                  ? 'Sign in to access your personalized menu'
                  : 'Create your account to start your health journey'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">First Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cta transition-colors" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="pl-10 h-11 bg-background/50 border-border/50 focus:border-cta transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Last Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cta transition-colors" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="pl-10 h-11 bg-background/50 border-border/50 focus:border-cta transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cta transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 bg-background/50 border-border/50 focus:border-cta transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Password</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs font-medium text-cta hover:underline transition-all"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cta transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="px-10 h-11 bg-background/50 border-border/50 focus:border-cta transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-bold cta-gradient shadow-lg shadow-cta/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {mode === 'login' ? 'Signing In...' : 'Joining...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full border-border/50" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-card px-3 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 border-border/50 hover:bg-muted/50 transition-all font-medium"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? (
                  <span>New here? <span className="text-cta font-bold ml-1">Create Account</span></span>
                ) : (
                  <span>Already have an account? <span className="text-cta font-bold ml-1">Sign In</span></span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;