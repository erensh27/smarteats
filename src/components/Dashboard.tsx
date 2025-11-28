import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import GroceryListSection from './GroceryListSection';
import NutritionTracker from './NutritionTracker';
import MealRecommendations from './MealRecommendations';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface MealSuggestion {
  name: string;
  description: string;
  cookingTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    vitamins: { [key: string]: string };
    minerals: { [key: string]: string };
  };
  whyRecommended: string;
  portionSize: string;
  substitutions?: string[];
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onLogout();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToGroceryList = async (items: string[]) => {
    try {
      // Load current grocery list
      const { data: existingData } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const currentItems = Array.isArray(existingData?.[0]?.items) ? existingData[0].items : [];
      
      // Add new items
      const newItems = items.map(item => ({
        id: crypto.randomUUID(),
        name: item,
        completed: false
      }));

      const updatedItems = [...currentItems, ...newItems];

      // Save updated list
      if (existingData && existingData.length > 0) {
        await supabase
          .from('grocery_lists')
          .update({ items: updatedItems as any })
          .eq('id', existingData[0].id);
      } else {
        await supabase
          .from('grocery_lists')
          .insert({
            user_id: user.id,
            items: updatedItems as any,
            name: 'My Grocery List'
          });
      }

      toast({
        title: "Items added to grocery list",
        description: `${items.length} ingredients added successfully`,
      });
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to add items to grocery list",
        variant: "destructive",
      });
    }
  };

  const handleLogMeal = async (meal: MealSuggestion) => {
    try {
      // Parse nutrition values and add to nutrition tracker
      const calories = parseInt(meal.nutrition.calories) || 0;
      const protein = parseInt(meal.nutrition.protein) || 0;
      const carbs = parseInt(meal.nutrition.carbs) || 0;
      const fat = parseInt(meal.nutrition.fat) || 0;
      const fiber = parseInt(meal.nutrition.fiber) || 0;

      // Add meal to meal history
      await supabase.from('meal_history').insert({
        user_id: user.id,
        meal_name: meal.name,
        meal_description: meal.description,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        cooked_at: new Date().toISOString(),
      });

      // Update nutrition totals
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('nutrient_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);

      const currentNutrition = existing?.[0] || {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
      };

      const updatedNutrition = {
        total_calories: (currentNutrition.total_calories || 0) + calories,
        total_protein: (currentNutrition.total_protein || 0) + protein,
        total_carbs: (currentNutrition.total_carbs || 0) + carbs,
        total_fat: (currentNutrition.total_fat || 0) + fat,
        total_fiber: (currentNutrition.total_fiber || 0) + fiber,
      };

      if (existing && existing.length > 0) {
        await supabase
          .from('nutrient_intake')
          .update(updatedNutrition)
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('nutrient_intake')
          .insert({
            user_id: user.id,
            date: today,
            ...updatedNutrition,
          });
      }

      toast({
        title: "Meal logged successfully",
        description: `${meal.name} added to your nutrition tracker`,
      });
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: "Error",
        description: "Failed to log meal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-primary">SmartEats</h1>
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Personal AI Agent</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.email?.split('@')[0]}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-xs sm:text-sm"
            >
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8 space-y-8 sm:space-y-12 px-4">
        <div className="text-center py-4 sm:py-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Hello! Ready to plan your meals and track your nutrition today?</h2>
          <p className="text-base sm:text-lg text-muted-foreground">Your personal AI agent for smarter eating and healthier living</p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <section>
            <MealRecommendations 
              user={user} 
              onAddToGroceryList={handleAddToGroceryList}
              onLogMeal={handleLogMeal}
            />
          </section>

          <section>
            <NutritionTracker user={user} />
          </section>

          <section>
            <GroceryListSection user={user} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;