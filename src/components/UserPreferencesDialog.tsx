import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface UserPreferences {
  tastes: string[];
  dietaryRestrictions: string[];
  cookingTime: string;
  cuisines: string[];
}

interface UserPreferencesDialogProps {
  user: User;
  preferences: UserPreferences;
  onPreferencesChange: (prefs: UserPreferences) => void;
}

const UserPreferencesDialog = ({ user, preferences, onPreferencesChange }: UserPreferencesDialogProps) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const tasteOptions = ['Sweet', 'Spicy', 'Savory', 'Mild', 'Tangy', 'Rich', 'Light', 'Smoky', 'Sour', 'Bitter', 'Umami', 'Fresh', 'Creamy', 'Crispy'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein', 'Paleo', 'Mediterranean', 'Low-Sodium', 'Sugar-Free', 'Raw Food', 'Pescatarian', 'Whole30'];
  const cookingTimeOptions = ['5-10 minutes', '10-30 minutes', 'n30-60 minutes', '60+ minutes'];
  const cuisineOptions = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'French', 'Middle Eastern', 'Thai', 'Japanese', 'Chinese', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Turkish'];

  const handleSave = async () => {
    try {
      // Save to user_preferences table
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const prefsData = {
        dietary_restrictions: localPrefs.dietaryRestrictions,
        taste_preferences: localPrefs.tastes,
        cooking_time_preference: parseInt(localPrefs.cookingTime.split('-')[0]) || 30,
        allergens: [], // Keep existing structure
        ingredients_available: [] // Keep existing structure
      };

      if (existing && existing.length > 0) {
        await supabase
          .from('user_preferences')
          .update(prefsData)
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...prefsData
          });
      }

      onPreferencesChange(localPrefs);
      setIsOpen(false);
      
      toast({
        title: "Preferences saved",
        description: "Your meal preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  const togglePreference = (category: keyof UserPreferences, value: string) => {
    setLocalPrefs(prev => {
      const currentArray = Array.isArray(prev[category]) ? prev[category] as string[] : [];
      return {
        ...prev,
        [category]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Set Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Food Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Taste Preferences */}
          <div>
            <Label className="text-base font-medium">Taste Preferences</Label>
            <p className="text-sm text-muted-foreground mb-3">What flavors do you enjoy? (Select all that apply)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {tasteOptions.map((taste) => (
                <div key={taste} className="flex items-center space-x-2">
                  <Checkbox
                    id={`taste-${taste}`}
                    checked={localPrefs.tastes.includes(taste)}
                    onCheckedChange={() => togglePreference('tastes', taste)}
                  />
                  <Label htmlFor={`taste-${taste}`} className="text-sm">{taste}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <Label className="text-base font-medium">Dietary Restrictions</Label>
            <p className="text-sm text-muted-foreground mb-3">Any dietary preferences or restrictions? (Select all that apply)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {dietaryOptions.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${diet}`}
                    checked={localPrefs.dietaryRestrictions.includes(diet)}
                    onCheckedChange={() => togglePreference('dietaryRestrictions', diet)}
                  />
                  <Label htmlFor={`diet-${diet}`} className="text-sm">{diet}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div>
            <Label className="text-base font-medium">Preferred Cooking Time</Label>
            <p className="text-sm text-muted-foreground mb-3">How much time do you usually have for cooking?</p>
            <Select value={localPrefs.cookingTime} onValueChange={(value) => setLocalPrefs(prev => ({ ...prev, cookingTime: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select cooking time" />
              </SelectTrigger>
              <SelectContent>
                {cookingTimeOptions.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cuisine Preferences */}
          <div>
            <Label className="text-base font-medium">Favorite Cuisines</Label>
            <p className="text-sm text-muted-foreground mb-3">What types of cuisine do you enjoy? (Select all that apply)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {cuisineOptions.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${cuisine}`}
                    checked={localPrefs.cuisines.includes(cuisine)}
                    onCheckedChange={() => togglePreference('cuisines', cuisine)}
                  />
                  <Label htmlFor={`cuisine-${cuisine}`} className="text-sm">{cuisine}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">Save Preferences</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserPreferencesDialog;