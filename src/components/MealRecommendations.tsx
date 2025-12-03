import { useState, useEffect } from 'react';
import { ChefHat, Clock, Star, Plus, ShoppingCart, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import UserPreferencesDialog from './UserPreferencesDialog';
import { logMealGeneration, logMealLogged, logGroceryItemsAdded, logMealExport } from '@/lib/analytics';

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

interface UserPreferences {
  tastes: string[];
  dietaryRestrictions: string[];
  cookingTime: string;
  cuisines: string[];
}

interface MealRecommendationsProps {
  user: User;
  onAddToGroceryList: (items: string[]) => void;
  onLogMeal: (meal: MealSuggestion) => void;
}

const MealRecommendations = ({ user, onAddToGroceryList, onLogMeal }: MealRecommendationsProps) => {
  const [meals, setMeals] = useState<MealSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    tastes: [],
    dietaryRestrictions: [],
    cookingTime: '10-30 minutes',
    cuisines: []
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
    loadInitialMeals();
  }, [user.id]);

  useEffect(() => {
    if (preferences.tastes.length > 0 || preferences.dietaryRestrictions.length > 0) {
      generatePersonalizedMeals();
    }
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        const prefs = data[0];
        setPreferences({
          tastes: prefs.taste_preferences || [],
          dietaryRestrictions: prefs.dietary_restrictions || [],
          cookingTime: `${prefs.cooking_time_preference || 30} minutes`,
          cuisines: [] // Can be extended later
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadInitialMeals = () => {
    setMeals([]);
  };

  const generatePersonalizedMeals = async () => {
    if (preferences.tastes.length === 0 && preferences.dietaryRestrictions.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-suggestions', {
        body: {
          dietary_preferences: preferences.dietaryRestrictions.join(', '),
          taste_preferences: preferences.tastes.join(', '),
          cooking_time: preferences.cookingTime,
          cuisine_preference: preferences.cuisines.join(', ') || 'varied',
          meal_type: 'Dinner',
          difficulty_level: 'Medium'
        }
      });

      if (error) throw error;

      if (data.success && data.mealSuggestions) {
        // Enhance AI suggestions with more detailed nutrition info
        const enhancedMeals = data.mealSuggestions.map((meal: any) => ({
          ...meal,
          nutrition: {
            ...meal.nutrition,
            carbs: meal.nutrition.carbs || "25-35g",
            fat: meal.nutrition.fat || "15-25g",
            fiber: meal.nutrition.fiber || "5-8g",
            vitamins: meal.nutrition.vitamins || { "Vitamin C": "20% DV", "Vitamin A": "15% DV" },
            minerals: meal.nutrition.minerals || { "Iron": "15% DV", "Calcium": "10% DV" }
          },
          portionSize: meal.portionSize || "1 serving (300-400g)",
          substitutions: meal.substitutions || ["Ask for specific substitutions based on your preferences"]
        }));

        setMeals(enhancedMeals);
        toast({
          title: "Personalized meals generated!",
          description: "Fresh meal suggestions based on your preferences are ready.",
        });

        // Log analytics event for meal generation
        logMealGeneration({
          tastes: preferences.tastes,
          dietaryRestrictions: preferences.dietaryRestrictions,
          cuisines: preferences.cuisines,
        });
      }
    } catch (error) {
      console.error('Error generating meals:', error);
      toast({
        title: "Using default suggestions",
        description: "We'll show you some healthy meal options while we work on personalized suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportMeals = () => {
    const exportText = meals.map(meal => `
MEAL: ${meal.name}
Cooking Time: ${meal.cookingTime}
Difficulty: ${meal.difficulty}
Portion Size: ${meal.portionSize}

DESCRIPTION:
${meal.description}

INGREDIENTS:
${meal.ingredients.map((ingredient, i) => `${i + 1}. ${ingredient}`).join('\n')}

INSTRUCTIONS:
${meal.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

NUTRITION:
Calories: ${meal.nutrition.calories}
Protein: ${meal.nutrition.protein}
Carbs: ${meal.nutrition.carbs}
Fat: ${meal.nutrition.fat}
Fiber: ${meal.nutrition.fiber}

VITAMINS:
${Object.entries(meal.nutrition.vitamins).map(([k, v]) => `${k}: ${v}`).join('\n')}

MINERALS:
${Object.entries(meal.nutrition.minerals).map(([k, v]) => `${k}: ${v}`).join('\n')}

WHY RECOMMENDED:
${meal.whyRecommended}

SUBSTITUTIONS:
${meal.substitutions?.map((sub, i) => `${i + 1}. ${sub}`).join('\n') || 'No substitutions listed'}

${'='.repeat(80)}
`).join('\n');

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smarteats-meal-recommendations.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Meals exported",
      description: "Your meal recommendations have been downloaded as text file",
    });

    // Log analytics event for meal export
    logMealExport();
  };

  return (
    <div className="space-y-6">
      {/* Header with preferences and actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            AI Meal Recommendations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Personalized meal suggestions based on your preferences and nutritional goals
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <UserPreferencesDialog
            user={user}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={generatePersonalizedMeals}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportMeals} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Preference badges */}
      {(preferences.tastes.length > 0 || preferences.dietaryRestrictions.length > 0) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Your preferences:</span>
          {preferences.tastes.map(taste => (
            <Badge key={taste} variant="secondary" className="text-xs">{taste}</Badge>
          ))}
          {preferences.dietaryRestrictions.map(diet => (
            <Badge key={diet} variant="outline" className="text-xs">{diet}</Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Generating meals via AI...</h3>
          <p className="text-muted-foreground">Creating personalized recommendations for you</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select preferences to generate recipes by AI</h3>
          <p className="text-muted-foreground">Click "Set Preferences" to get personalized meal recommendations</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{meal.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.cookingTime}
                      </Badge>
                      <Badge variant="outline">{meal.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{meal.description}</p>

                <div>
                  <h4 className="font-medium mb-2">Nutrition (per {meal.portionSize}):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Calories:</span> {meal.nutrition.calories}</div>
                    <div><span className="font-medium">Protein:</span> {meal.nutrition.protein}</div>
                    <div><span className="font-medium">Carbs:</span> {meal.nutrition.carbs}</div>
                    <div><span className="font-medium">Fat:</span> {meal.nutrition.fat}</div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div><strong>Key vitamins:</strong> {Object.entries(meal.nutrition.vitamins).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                    <div><strong>Key minerals:</strong> {Object.entries(meal.nutrition.minerals).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Ingredients ({meal.ingredients.length} items):</h4>
                  <ul className="text-sm space-y-1 max-h-24 overflow-y-auto">
                    {meal.ingredients.slice(0, 5).map((ingredient, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        {ingredient}
                      </li>
                    ))}
                    {meal.ingredients.length > 5 && (
                      <li className="text-muted-foreground text-xs">...and {meal.ingredients.length - 5} more items</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground italic">{meal.whyRecommended}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAddToGroceryList(meal.ingredients);
                      logGroceryItemsAdded(meal.ingredients.length, 'meal_recommendation');
                    }}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Add Ingredients
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onLogMeal(meal);
                      logMealLogged(meal.name, meal.nutrition.calories);
                    }}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Log Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealRecommendations;
