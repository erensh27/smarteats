import { useState, useEffect } from 'react';
import { Plus, X, Check, Download, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  [key: string]: any;
}

interface GroceryListSectionProps {
  user: User;
}

const GroceryListSection = ({ user }: GroceryListSectionProps) => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGroceryList();
  }, [user.id]);

  const loadGroceryList = async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0 && Array.isArray(data[0].items)) {
        setItems(data[0].items as GroceryItem[]);
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGroceryList = async (updatedItems: GroceryItem[]) => {
    try {
      const { data: existing } = await supabase
        .from('grocery_lists')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from('grocery_lists')
          .update({ items: updatedItems as any })
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('grocery_lists')
          .insert({
            user_id: user.id,
            items: updatedItems as any,
            name: 'My Grocery List'
          });
      }
    } catch (error) {
      console.error('Error saving grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to save grocery list",
        variant: "destructive",
      });
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    const newGroceryItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: newItem.trim(),
      completed: false
    };

    const updatedItems = [...items, newGroceryItem];
    setItems(updatedItems);
    setNewItem('');
    await saveGroceryList(updatedItems);

    toast({
      title: "Item added",
      description: `${newGroceryItem.name} added to your grocery list`,
    });
  };

  const toggleItem = async (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    await saveGroceryList(updatedItems);
  };

  const removeItem = async (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await saveGroceryList(updatedItems);

    toast({
      title: "Item removed",
      description: "Item removed from your grocery list",
    });
  };

  const exportGroceryList = () => {
    const exportData = {
      date: new Date().toISOString().split('T')[0],
      items: items.map(item => ({
        name: item.name,
        completed: item.completed
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Grocery list exported",
      description: "Your grocery list has been downloaded",
    });
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Grocery List
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {totalCount === 0 
              ? "Your list is empty. Add items you need today!" 
              : `${completedCount}/${totalCount} items completed`
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportGroceryList} disabled={items.length === 0} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Instructions */}
      {items.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm space-y-1">
            <p>• Click an item to mark it as done</p>
            <p>• Click the X to remove items</p>
            <p>• Click "Add Item" to include more groceries</p>
          </div>
        </div>
      )}

      {/* Add new item */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Add item to grocery list..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="flex-1"
        />
        <Button onClick={addItem} disabled={!newItem.trim()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </div>

      {/* Grocery items */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted/10 rounded-lg">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Your grocery list is empty</h3>
          <p className="text-muted-foreground mb-4">Add items you want to buy today!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Incomplete items first */}
          {items
            .filter(item => !item.completed)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex-shrink-0 w-5 h-5 rounded border-2 border-muted-foreground hover:border-primary transition-colors"
                >
                </button>
                <span
                  className="flex-1 cursor-pointer text-foreground"
                  onClick={() => toggleItem(item.id)}
                >
                  {item.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          
          {/* Completed items */}
          {items
            .filter(item => item.completed)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-muted bg-muted/50 transition-colors"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex-shrink-0 w-5 h-5 rounded border-2 bg-primary border-primary text-primary-foreground transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
                <span
                  className="flex-1 cursor-pointer line-through text-muted-foreground"
                  onClick={() => toggleItem(item.id)}
                >
                  {item.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GroceryListSection;