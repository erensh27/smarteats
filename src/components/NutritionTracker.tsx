import { useState, useEffect } from 'react';
import { Plus, Download, Trash2, Edit, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface NutritionData {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  vitamin_a: number;
  vitamin_b6: number;
  vitamin_b12: number;
  vitamin_c: number;
  vitamin_d: number;
  vitamin_e: number;
  vitamin_k: number;
  iron: number;
  calcium: number;
  magnesium: number;
  potassium: number;
  zinc: number;
}

interface LoggedFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  timestamp: string;
}

interface NutritionTrackerProps {
  user: User;
}

const NutritionTracker = ({ user }: NutritionTrackerProps) => {
  const [nutrition, setNutrition] = useState<NutritionData>({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    total_fiber: 0,
    vitamin_a: 0,
    vitamin_b6: 0,
    vitamin_b12: 0,
    vitamin_c: 0,
    vitamin_d: 0,
    vitamin_e: 0,
    vitamin_k: 0,
    iron: 0,
    calcium: 0,
    magnesium: 0,
    potassium: 0,
    zinc: 0,
  });

  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [foodForm, setFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTodaysNutrition();
    loadTodaysMeals();
  }, [user.id]);

  const loadTodaysNutrition = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('nutrient_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setNutrition({
          total_calories: data[0].total_calories || 0,
          total_protein: data[0].total_protein || 0,
          total_carbs: data[0].total_carbs || 0,
          total_fat: data[0].total_fat || 0,
          total_fiber: data[0].total_fiber || 0,
          vitamin_a: data[0].vitamin_a || 0,
          vitamin_b6: data[0].vitamin_b6 || 0,
          vitamin_b12: data[0].vitamin_b12 || 0,
          vitamin_c: data[0].vitamin_c || 0,
          vitamin_d: data[0].vitamin_d || 0,
          vitamin_e: data[0].vitamin_e || 0,
          vitamin_k: data[0].vitamin_k || 0,
          iron: data[0].iron || 0,
          calcium: data[0].calcium || 0,
          magnesium: data[0].magnesium || 0,
          potassium: data[0].potassium || 0,
          zinc: data[0].zinc || 0,
        });
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('cooked_at', today)
        .lt('cooked_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('cooked_at', { ascending: false });

      if (error) throw error;

      const foods: LoggedFood[] = data.map(meal => ({
        id: meal.id,
        name: meal.meal_name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        fiber: meal.fiber || 0,
        timestamp: meal.cooked_at
      }));

      setLoggedFoods(foods);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const addFood = async () => {
    if (!foodForm.name.trim() || !foodForm.calories) return;

    const calories = parseFloat(foodForm.calories) || 0;
    const protein = parseFloat(foodForm.protein) || 0;
    const carbs = parseFloat(foodForm.carbs) || 0;
    const fat = parseFloat(foodForm.fat) || 0;
    const fiber = parseFloat(foodForm.fiber) || 0;

    // Calculate estimated vitamins/minerals based on food type (simplified estimation)
    const estimatedNutrients = estimateNutrients(foodForm.name, calories);

    const updatedNutrition = {
      ...nutrition,
      total_calories: nutrition.total_calories + calories,
      total_protein: nutrition.total_protein + protein,
      total_carbs: nutrition.total_carbs + carbs,
      total_fat: nutrition.total_fat + fat,
      total_fiber: nutrition.total_fiber + fiber,
      vitamin_a: nutrition.vitamin_a + estimatedNutrients.vitamin_a,
      vitamin_c: nutrition.vitamin_c + estimatedNutrients.vitamin_c,
      iron: nutrition.iron + estimatedNutrients.iron,
      calcium: nutrition.calcium + estimatedNutrients.calcium,
    };

    setNutrition(updatedNutrition);
    await saveNutritionData(updatedNutrition);

    // Log the meal
    await supabase.from('meal_history').insert({
      user_id: user.id,
      meal_name: foodForm.name,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fiber: fiber,
      cooked_at: new Date().toISOString(),
    });

    // Add to logged foods
    const newFood: LoggedFood = {
      id: crypto.randomUUID(),
      name: foodForm.name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      timestamp: new Date().toISOString()
    };
    setLoggedFoods(prev => [newFood, ...prev]);

    setFoodForm({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
    setIsDialogOpen(false);

    toast({
      title: "Food added",
      description: `${foodForm.name} logged successfully`,
    });
  };

  const estimateNutrients = (foodName: string, calories: number) => {
    // Simplified nutrient estimation based on food name keywords
    const name = foodName.toLowerCase();
    const base = calories / 100; // Scale with calories

    let vitamin_a = 0, vitamin_c = 0, iron = 0, calcium = 0;

    if (name.includes('carrot') || name.includes('sweet potato')) vitamin_a = base * 15;
    if (name.includes('orange') || name.includes('citrus') || name.includes('tomato')) vitamin_c = base * 10;
    if (name.includes('spinach') || name.includes('meat') || name.includes('bean')) iron = base * 2;
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) calcium = base * 12;

    return { vitamin_a, vitamin_c, iron, calcium };
  };

  const removeFood = async (foodId: string) => {
    const food = loggedFoods.find(f => f.id === foodId);
    if (!food) return;

    // Remove from nutrition totals
    const updatedNutrition = {
      ...nutrition,
      total_calories: Math.max(0, nutrition.total_calories - food.calories),
      total_protein: Math.max(0, nutrition.total_protein - food.protein),
      total_carbs: Math.max(0, nutrition.total_carbs - (food.carbs || 0)),
      total_fat: Math.max(0, nutrition.total_fat - (food.fat || 0)),
      total_fiber: Math.max(0, nutrition.total_fiber - (food.fiber || 0)),
    };

    setNutrition(updatedNutrition);
    await saveNutritionData(updatedNutrition);

    // Remove from logged foods
    setLoggedFoods(prev => prev.filter(f => f.id !== foodId));

    toast({
      title: "Food removed",
      description: `${food.name} removed from your tracker`,
    });
  };

  const saveNutritionData = async (data: NutritionData) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('nutrient_intake')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from('nutrient_intake')
          .update(data)
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('nutrient_intake')
          .insert({
            user_id: user.id,
            date: today,
            ...data,
          });
      }
    } catch (error) {
      console.error('Error saving nutrition data:', error);
    }
  };

  const exportNutritionData = () => {
    const exportData = {
      date: new Date().toISOString().split('T')[0],
      nutrition,
      loggedFoods: loggedFoods.map(food => ({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        timestamp: food.timestamp
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutrition-summary.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Nutrition data exported",
      description: "Your daily nutrition summary has been downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Nutrition Tracker
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Track your daily nutrient intake and reach your health goals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button variant="outline" size="sm" onClick={exportNutritionData} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="text-sm space-y-1">
          <p>• Add any food you just ate to update your nutrition</p>
          <p>• You can enter custom foods manually or log meals from AI suggestions</p>
          <p>• All values start at 0 and update automatically after each addition</p>
        </div>
      </div>

      {/* Macronutrients - Main display */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-4">Daily Macronutrients</h3>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(nutrition.total_calories)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Calories</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(nutrition.total_protein)}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Protein</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(nutrition.total_carbs)}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Carbs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(nutrition.total_fat)}g</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Fat</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vitamins & Minerals */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <div>
          <h4 className="font-medium mb-3">Vitamins</h4>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { key: 'vitamin_a', label: 'Vit A', value: nutrition.vitamin_a },
              { key: 'vitamin_b6', label: 'Vit B6', value: nutrition.vitamin_b6 },
              { key: 'vitamin_b12', label: 'Vit B12', value: nutrition.vitamin_b12 },
              { key: 'vitamin_c', label: 'Vit C', value: nutrition.vitamin_c },
              { key: 'vitamin_d', label: 'Vit D', value: nutrition.vitamin_d },
              { key: 'vitamin_e', label: 'Vit E', value: nutrition.vitamin_e },
              { key: 'vitamin_k', label: 'Vit K', value: nutrition.vitamin_k }
            ].map(vitamin => (
              <div key={vitamin.key} className="text-center p-2 bg-muted/20 rounded text-sm">
                <div className="font-medium">{Math.round(vitamin.value)}</div>
                <div className="text-xs text-muted-foreground">{vitamin.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Minerals</h4>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { key: 'iron', label: 'Iron', value: nutrition.iron },
              { key: 'calcium', label: 'Calcium', value: nutrition.calcium },
              { key: 'magnesium', label: 'Magnesium', value: nutrition.magnesium },
              { key: 'potassium', label: 'Potassium', value: nutrition.potassium },
              { key: 'zinc', label: 'Zinc', value: nutrition.zinc }
            ].map(mineral => (
              <div key={mineral.key} className="text-center p-2 bg-muted/20 rounded text-sm">
                <div className="font-medium">{Math.round(mineral.value)}</div>
                <div className="text-xs text-muted-foreground">{mineral.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logged Foods */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Today's Logged Foods</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Food to Nutrition Tracker</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="food-name">Food Name *</Label>
                  <Input
                    id="food-name"
                    value={foodForm.name}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grilled chicken breast, Apple, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories *</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={foodForm.calories}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, calories: e.target.value }))}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={foodForm.protein}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={foodForm.carbs}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, carbs: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={foodForm.fat}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      value={foodForm.fiber}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, fiber: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                </div>
                <Button onClick={addFood} className="w-full" disabled={!foodForm.name.trim() || !foodForm.calories}>
                  Add Food
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loggedFoods.length === 0 ? (
          <div className="text-center py-8 bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">No foods logged today</p>
            <p className="text-sm text-muted-foreground">Start tracking by adding your first meal!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {loggedFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{food.name}</div>
                  {food.name === 'Healthy Swap Analysis' ? (
                    // Special display for Healthy Swap entries
                    <>
                      <div className="text-sm text-[hsl(142,76%,50%)] flex items-center gap-1">
                        <span>✓</span>
                        <span>Healthy Swap Made</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  ) : (
                    // Regular display for normal food entries
                    <>
                      <div className="text-sm text-muted-foreground">
                        {food.calories} cal • {food.protein}g protein
                        {food.carbs && ` • ${food.carbs}g carbs`}
                        {food.fat && ` • ${food.fat}g fat`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFood(food.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionTracker;