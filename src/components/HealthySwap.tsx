import { useState } from 'react';
import { ArrowLeft, Sparkles, ArrowRight, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logHealthySwap } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HealthySwapProps {
    user: User;
    onBack: () => void;
}

interface SwapSuggestion {
    original: string;
    replacement: string;
    reason: string;
    healthBenefit: string;
}

// Comprehensive healthy substitution database
const HEALTHY_SUBSTITUTIONS: { [key: string]: { replacement: string; reason: string; healthBenefit: string } } = {
    // Oils and Fats
    'butter': { replacement: 'olive oil or avocado oil', reason: 'Lower in saturated fat', healthBenefit: 'Better heart health, rich in monounsaturated fats' },
    'vegetable oil': { replacement: 'extra virgin olive oil', reason: 'Higher in antioxidants', healthBenefit: 'Anti-inflammatory properties, heart-healthy' },
    'margarine': { replacement: 'mashed avocado or olive oil', reason: 'No trans fats', healthBenefit: 'Natural healthy fats, better nutrient profile' },
    'lard': { replacement: 'coconut oil or olive oil', reason: 'Plant-based alternative', healthBenefit: 'Lower cholesterol impact' },

    // Sweeteners
    'white sugar': { replacement: 'honey, maple syrup, or stevia', reason: 'Lower glycemic index', healthBenefit: 'Better blood sugar control, contains antioxidants' },
    'brown sugar': { replacement: 'coconut sugar or date paste', reason: 'More minerals and fiber', healthBenefit: 'Slower sugar absorption, trace nutrients' },
    'corn syrup': { replacement: 'pure maple syrup or honey', reason: 'Natural sweetener', healthBenefit: 'Contains beneficial enzymes and minerals' },
    'artificial sweetener': { replacement: 'stevia or monk fruit', reason: 'Natural zero-calorie option', healthBenefit: 'No artificial chemicals' },

    // Grains and Flours
    'white rice': { replacement: 'brown rice, quinoa, or cauliflower rice', reason: 'Higher fiber and nutrients', healthBenefit: 'Better digestion, more vitamins and minerals' },
    'white flour': { replacement: 'whole wheat flour or almond flour', reason: 'More fiber and protein', healthBenefit: 'Better satiety, lower glycemic impact' },
    'pasta': { replacement: 'whole wheat pasta, zucchini noodles, or chickpea pasta', reason: 'Higher protein and fiber', healthBenefit: 'Better blood sugar control, more nutrients' },
    'white bread': { replacement: 'whole grain bread or sprouted bread', reason: 'More fiber and nutrients', healthBenefit: 'Better digestion, sustained energy' },
    'breadcrumbs': { replacement: 'crushed almonds or panko whole wheat', reason: 'More protein and healthy fats', healthBenefit: 'Better nutrient density' },

    // Dairy
    'whole milk': { replacement: 'almond milk, oat milk, or low-fat milk', reason: 'Lower calories and saturated fat', healthBenefit: 'Easier digestion, fortified with vitamins' },
    'heavy cream': { replacement: 'coconut cream or Greek yogurt', reason: 'Lower saturated fat', healthBenefit: 'Protein boost, probiotics (yogurt)' },
    'sour cream': { replacement: 'Greek yogurt or cashew cream', reason: 'Higher protein, lower fat', healthBenefit: 'Probiotics, better protein content' },
    'cream cheese': { replacement: 'Neufchâtel or blended cottage cheese', reason: 'Lower fat content', healthBenefit: 'More protein, fewer calories' },
    'cheddar cheese': { replacement: 'reduced-fat cheddar or nutritional yeast', reason: 'Lower saturated fat', healthBenefit: 'Fewer calories, B-vitamins (nutritional yeast)' },

    // Proteins
    'ground beef': { replacement: 'ground turkey, chicken, or plant-based meat', reason: 'Leaner protein', healthBenefit: 'Lower saturated fat, fewer calories' },
    'bacon': { replacement: 'turkey bacon or tempeh bacon', reason: 'Lower fat and sodium', healthBenefit: 'Reduced cancer risk, heart-healthy' },
    'sausage': { replacement: 'chicken sausage or plant-based sausage', reason: 'Lower fat content', healthBenefit: 'Fewer preservatives, lower calories' },
    'fried chicken': { replacement: 'grilled or baked chicken', reason: 'Less oil and calories', healthBenefit: 'Lower fat, same protein' },
    'pork': { replacement: 'lean pork loin or chicken breast', reason: 'Leaner cut', healthBenefit: 'Lower saturated fat' },

    // Condiments and Sauces
    'mayonnaise': { replacement: 'Greek yogurt or avocado', reason: 'Lower fat, higher protein', healthBenefit: 'Probiotics, healthy fats' },
    'ketchup': { replacement: 'tomato paste with herbs or low-sugar ketchup', reason: 'Less added sugar', healthBenefit: 'More lycopene, fewer calories' },
    'ranch dressing': { replacement: 'Greek yogurt-based dressing', reason: 'Lower calories and fat', healthBenefit: 'More protein, probiotics' },
    'soy sauce': { replacement: 'coconut aminos or low-sodium soy sauce', reason: 'Lower sodium', healthBenefit: 'Better for blood pressure' },
    'teriyaki sauce': { replacement: 'homemade with less sugar', reason: 'Control sugar content', healthBenefit: 'Fewer preservatives' },

    // Snacks and Misc
    'potato chips': { replacement: 'baked veggie chips or air-popped popcorn', reason: 'Less oil and calories', healthBenefit: 'More fiber, fewer unhealthy fats' },
    'french fries': { replacement: 'baked sweet potato fries', reason: 'Less oil, more nutrients', healthBenefit: 'Higher in vitamin A and fiber' },
    'ice cream': { replacement: 'frozen yogurt or nice cream (frozen banana)', reason: 'Lower fat and sugar', healthBenefit: 'Probiotics, natural sweetness' },
    'chocolate': { replacement: 'dark chocolate (70%+ cacao)', reason: 'Less sugar, more antioxidants', healthBenefit: 'Heart health, mood boost' },
    'salt': { replacement: 'herbs, spices, or low-sodium salt', reason: 'Reduce sodium intake', healthBenefit: 'Better blood pressure control' },
    'croutons': { replacement: 'toasted nuts or seeds', reason: 'More protein and healthy fats', healthBenefit: 'Better nutrient density' },
};

const HealthySwap = ({ user, onBack }: HealthySwapProps) => {
    const [pastedRecipe, setPastedRecipe] = useState('');
    const [swappedRecipe, setSwappedRecipe] = useState('');
    const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const findHealthySwaps = (recipeText: string): SwapSuggestion[] => {
        const swaps: SwapSuggestion[] = [];
        const lowerRecipe = recipeText.toLowerCase();

        // Check each ingredient in our database
        Object.keys(HEALTHY_SUBSTITUTIONS).forEach(ingredient => {
            // Use word boundaries to match whole words
            const regex = new RegExp(`\\b${ingredient}\\b`, 'gi');
            if (regex.test(lowerRecipe)) {
                const sub = HEALTHY_SUBSTITUTIONS[ingredient];
                swaps.push({
                    original: ingredient,
                    replacement: sub.replacement,
                    reason: sub.reason,
                    healthBenefit: sub.healthBenefit
                });
            }
        });

        return swaps;
    };

    const applySwaps = (recipeText: string, swaps: SwapSuggestion[]): string => {
        let modifiedRecipe = recipeText;

        swaps.forEach(swap => {
            // Replace with case-insensitive regex, preserving original case style
            const regex = new RegExp(`\\b${swap.original}\\b`, 'gi');
            modifiedRecipe = modifiedRecipe.replace(regex, (match) => {
                // Try to preserve capitalization
                if (match[0] === match[0].toUpperCase()) {
                    return swap.replacement.charAt(0).toUpperCase() + swap.replacement.slice(1);
                }
                return swap.replacement;
            });
        });

        return modifiedRecipe;
    };

    const handleProcessRecipe = async () => {
        if (!pastedRecipe.trim()) {
            toast({
                title: "No recipe provided",
                description: "Please paste a recipe to analyze",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Find all possible healthy swaps
            const foundSwaps = findHealthySwaps(pastedRecipe);

            if (foundSwaps.length === 0) {
                toast({
                    title: "Great recipe!",
                    description: "No unhealthy ingredients found to swap. This recipe is already quite healthy!",
                });
                setIsProcessing(false);
                return;
            }

            // Apply swaps to create new recipe
            const newRecipe = applySwaps(pastedRecipe, foundSwaps);

            setSuggestions(foundSwaps);
            setSwappedRecipe(newRecipe);

            toast({
                title: "Healthy swaps found!",
                description: `Found ${foundSwaps.length} healthier alternatives for your recipe`,
            });

            // Log the swap activity
            await supabase.from('meal_history').insert({
                user_id: user.id,
                meal_name: 'Healthy Swap Analysis',
                meal_description: `Analyzed recipe with ${foundSwaps.length} healthy substitutions`,
                cooked_at: new Date().toISOString(),
            });

            // Log analytics event for healthy swap
            logHealthySwap(foundSwaps.length);

        } catch (error) {
            console.error('Error processing recipe:', error);
            toast({
                title: "Error",
                description: "Failed to process recipe. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Recipe copied to clipboard",
        });
    };

    const downloadRecipe = (text: string, filename: string) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Downloaded!",
            description: "Recipe saved to your device",
        });
    };

    const resetForm = () => {
        setPastedRecipe('');
        setSwappedRecipe('');
        setSuggestions([]);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cta" />
                            <h1 className="text-lg sm:text-2xl font-bold text-cta">Healthy Swap</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                            AI-Powered Recipe Optimizer
                        </span>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container py-6 sm:py-8 px-4 space-y-6">
                {/* Hero Section */}
                <div className="text-center py-4 sm:py-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">
                        Transform Your Recipes Into Healthier Versions
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Paste any exported recipe and get instant healthy ingredient substitutions powered by our nutrition database
                    </p>
                </div>

                {/* Info Card */}
                <Card className="border-[hsl(142,76%,20%)] bg-[hsl(142,76%,5%)]">
                    <CardContent className="p-4">
                        <div className="text-sm space-y-2">
                            <p className="text-[hsl(142,76%,70%)]">
                                <strong>How it works:</strong>
                            </p>
                            <ul className="space-y-1 text-muted-foreground ml-4">
                                <li>• Export any recipe from the AI Meal Recommendations section</li>
                                <li>• Paste the recipe text in the box below</li>
                                <li>• Our AI analyzes and suggests healthier ingredient swaps</li>
                                <li>• Get a new recipe with better nutrition profile</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input Section */}
                    <Card className="border-[hsl(142,76%,20%)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>Original Recipe</span>
                                {pastedRecipe && (
                                    <Badge variant="outline" className="ml-auto">
                                        {pastedRecipe.split('\n').filter(line => line.trim()).length} lines
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste your exported recipe here...&#10;&#10;Example:&#10;MEAL: Creamy Pasta&#10;INGREDIENTS:&#10;1. White pasta - 200g&#10;2. Heavy cream - 100ml&#10;3. Butter - 50g&#10;4. White sugar - 2 tbsp&#10;..."
                                value={pastedRecipe}
                                onChange={(e) => setPastedRecipe(e.target.value)}
                                className="min-h-[400px] font-mono text-sm"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleProcessRecipe}
                                    disabled={isProcessing || !pastedRecipe.trim()}
                                    className="flex-1 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,42%)] text-white"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Find Healthy Swaps
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetForm}
                                    disabled={!pastedRecipe && !swappedRecipe}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Output Section */}
                    <Card className="border-[hsl(142,76%,20%)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>Healthier Version</span>
                                {swappedRecipe && (
                                    <Badge className="ml-auto bg-[hsl(142,76%,36%)] text-white">
                                        {suggestions.length} swaps made
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {swappedRecipe ? (
                                <>
                                    <Textarea
                                        value={swappedRecipe}
                                        readOnly
                                        className="min-h-[400px] font-mono text-sm bg-muted/20"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => copyToClipboard(swappedRecipe)}
                                            className="flex-1"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadRecipe(swappedRecipe, 'healthy-recipe.txt')}
                                            className="flex-1"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="min-h-[400px] flex items-center justify-center text-center p-8 bg-muted/10 rounded-lg border-2 border-dashed border-muted">
                                    <div>
                                        <ArrowRight className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">
                                            Your healthier recipe will appear here
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Paste a recipe and click "Find Healthy Swaps"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                    <Card className="border-[hsl(142,76%,20%)] bg-[hsl(142,76%,5%)]">
                        <CardHeader>
                            <CardTitle className="text-[hsl(142,76%,70%)]">
                                Healthy Substitutions Made ({suggestions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {suggestions.map((swap, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg bg-background/50 border border-[hsl(142,76%,20%)] hover:border-[hsl(142,76%,36%)] transition-colors"
                                    >
                                        <div className="flex items-start gap-2 mb-3">
                                            <div className="flex-1">
                                                <div className="text-sm text-destructive line-through">
                                                    {swap.original}
                                                </div>
                                                <div className="text-base font-semibold text-[hsl(142,76%,50%)] flex items-center gap-1">
                                                    <ArrowRight className="w-4 h-4" />
                                                    {swap.replacement}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-[hsl(142,76%,20%)]">
                                            <div className="flex items-center gap-1 text-[hsl(142,76%,60%)] text-sm font-medium">
                                                <span className="text-lg">✓</span>
                                                <span>Healthy Swap Made</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tips Section */}
                <Card className="border-[hsl(142,76%,20%)]">
                    <CardHeader>
                        <CardTitle className="text-[hsl(142,76%,70%)]">Pro Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-[hsl(142,76%,50%)]">Best Practices</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Use exported recipes from AI recommendations for best results</li>
                                    <li>• Review each substitution to match your taste preferences</li>
                                    <li>• Some swaps may slightly alter cooking times or methods</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-[hsl(142,76%,50%)]">Health Benefits</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Lower saturated fats and cholesterol</li>
                                    <li>• Increased fiber and protein content</li>
                                    <li>• Better vitamin and mineral profiles</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default HealthySwap;
