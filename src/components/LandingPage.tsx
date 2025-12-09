import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator, CircularProgress, NutrientCard } from '@/components/ui/progress-indicator';
import { TrendingUp, Globe, Zap, Brain, ChefHat, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import smartEatsLogo from '@/assets/smarteats-logo.png';

const mockNutrientData = [
  { month: 'Jan', vitaminA: 45, vitaminC: 52, iron: 38, calcium: 42 },
  { month: 'Feb', vitaminA: 52, vitaminC: 61, iron: 44, calcium: 48 },
  { month: 'Mar', vitaminA: 58, vitaminC: 68, iron: 52, calcium: 55 },
  { month: 'Apr', vitaminA: 65, vitaminC: 74, iron: 59, calcium: 62 },
  { month: 'May', vitaminA: 72, vitaminC: 81, iron: 67, calcium: 69 },
  { month: 'Jun', vitaminA: 78, vitaminC: 87, iron: 74, calcium: 76 },
];

const mockUserStats = [
  { metric: '100+ Countries', value: 'Global Reach', icon: Globe },
  { metric: 'Regional Dishes', value: 'Available', icon: ChefHat },
  { metric: 'Health Improvements', value: '89%', icon: Heart },
];

interface LandingPageProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

const LandingPage = ({ onAuthClick }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Theme Toggle */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={smartEatsLogo}
            alt="SmartEats Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-bold text-foreground">SmartEats</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card opacity-90" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`space-y-8 animate-fade-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    SmartEats
                  </span>
                </h1>
                <p className="text-2xl lg:text-3xl text-cta font-semibold max-w-3xl mx-auto">
                  Personalized Meals, Smarter Health
                </p>

                {/* Enhanced taglines */}
                <div className="space-y-4 text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                  <p>Personalized meals for your taste and health.</p>
                  <p>Track nutrients, enjoy cooking, optimize wellness.</p>
                  <p>AI-powered meal recommendations for a healthier lifestyle.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center max-w-3xl mx-auto mb-8">
                <div className="flex flex-col items-center gap-2">
                  <Brain className="w-8 h-8 text-cta" />
                  <p className="text-base text-muted-foreground">
                    Turn What-to-Cook Dilemma into Smart Recommendations
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-8 h-8 text-cta" />
                  <p className="text-base text-muted-foreground">
                    Track Nutrition, Optimize Health, Enjoy Cooking
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-cta" />
                  <p className="text-base text-muted-foreground">
                    AI-Powered Meal Planning for Peak Performance
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => onAuthClick('signup')}
                  className="text-lg px-8 py-6"
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => onAuthClick('login')}
                  className="text-lg px-8 py-6"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Global Impact, Local Flavors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Available in 100+ countries with regional dishes from around the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mockUserStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center glass border-border/50 hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <Icon className="w-12 h-12 mx-auto text-cta mb-4" />
                    <CardTitle className="text-2xl font-bold">{stat.metric}</CardTitle>
                    <CardDescription className="text-lg text-cta">{stat.value}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nutrition Progress Display */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Track Your Nutrient Optimization
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch your vitamin and mineral intake stabilize as SmartEats learns your preferences
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Overall Progress */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-center">Overall Nutrition Progress</CardTitle>
                <CardDescription className="text-center">
                  Average improvement across all key nutrients
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CircularProgress
                  value={87}
                  size={150}
                  color="hsl(var(--cta))"
                  className="animate-scale-in"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cta">87%</div>
                    <div className="text-sm text-muted-foreground">Optimized</div>
                  </div>
                </CircularProgress>
              </CardContent>
            </Card>

            {/* Individual Nutrients */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <NutrientCard
                nutrient="Vitamin A"
                value={1850}
                target={2000}
                unit="μg"
                trend="up"
                className="animate-fade-in glass border-border/50"
              />
              <NutrientCard
                nutrient="Vitamin C"
                value={78}
                target={90}
                unit="mg"
                trend="up"
                className="animate-fade-in glass border-border/50"
              />
              <NutrientCard
                nutrient="Iron"
                value={14.2}
                target={18}
                unit="mg"
                trend="up"
                className="animate-fade-in glass border-border/50"
              />
              <NutrientCard
                nutrient="Calcium"
                value={920}
                target={1000}
                unit="mg"
                trend="stable"
                className="animate-fade-in glass border-border/50"
              />
            </div>

            {/* Progress Bars */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Daily Nutrition Goals</CardTitle>
                <CardDescription>
                  Track your progress towards optimal daily nutrient intake
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressIndicator
                  label="Protein Intake"
                  value={92}
                  color="hsl(var(--cta))"
                />
                <ProgressIndicator
                  label="Fiber Intake"
                  value={76}
                  color="hsl(var(--warning))"
                />
                <ProgressIndicator
                  label="Omega-3 Fatty Acids"
                  value={88}
                  color="hsl(var(--primary))"
                />
                <ProgressIndicator
                  label="Antioxidants"
                  value={94}
                  color="hsl(var(--destructive))"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose SmartEats?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of personalized nutrition with AI that learns your preferences,
              suggests meals based on your health goals, and helps you discover new flavors while optimizing wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Recommendations",
                description: "Get personalized meal suggestions based on your taste, dietary restrictions, and nutritional goals.",
                icon: Brain
              },
              {
                title: "Nutrient Tracking",
                description: "Monitor your vitamin and mineral intake with detailed analytics and progress visualization.",
                icon: TrendingUp
              },
              {
                title: "Smart Grocery Lists",
                description: "Automatically generated shopping lists based on your chosen meals and preferences.",
                icon: ChefHat
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass border-border/50 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <Icon className="w-10 h-10 text-cta mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-background to-card">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Transform Your Nutrition?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join the SmartEats community and start your journey to better health today.
            </p>
            <Button
              variant="cta"
              size="lg"
              onClick={() => onAuthClick('signup')}
              className="text-xl px-12 py-8"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;