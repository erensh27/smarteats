import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check URL params for auth mode
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    if (authParam === 'login' || authParam === 'signup') {
      setAuthMode(authParam);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          toast({
            title: "Welcome to SmartEats!",
            description: "You're now signed in and ready to start your nutrition journey.",
          });
          setAuthMode(null);
          // Clear auth params from URL
          window.history.replaceState({}, '', '/');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    window.history.pushState({}, '', `/?auth=${mode}`);
  };

  const handleAuthBack = () => {
    setAuthMode(null);
    window.history.replaceState({}, '', '/');
  };

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
    setAuthMode(null);
    window.history.replaceState({}, '', '/');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode(null);
    window.history.replaceState({}, '', '/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-2xl font-bold">SmartEats</div>
          <div className="text-sm text-muted-foreground mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (authMode) {
    return (
      <AuthPage 
        mode={authMode} 
        onBack={handleAuthBack} 
        onSuccess={handleAuthSuccess} 
      />
    );
  }

  return <LandingPage onAuthClick={handleAuthClick} />;
};

export default Index;
