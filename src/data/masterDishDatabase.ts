// MASTER DISH DATABASE - 1000+ Recipes
// Combines all dish databases for SmartEats meal recommendations
// 700 Indian dishes + 300 International dishes

import { DishData } from './dishDatabase';
import INDIAN_DISHES from './indianDishes';
import INTERNATIONAL_DISHES from './internationalDishes';

// Combine all databases
export const MASTER_DISH_DATABASE: DishData[] = [
    ...INDIAN_DISHES,
    ...INTERNATIONAL_DISHES
];

// Helper functions for filtering dishes

/**
 * Filter dishes by dietary preferences
 */
export const filterByDiet = (dishes: DishData[], dietaryTags: string[]): DishData[] => {
    if (dietaryTags.length === 0) return dishes;

    return dishes.filter(dish =>
        dietaryTags.some(tag => dish.dietaryTags.includes(tag))
    );
};

/**
 * Filter dishes by taste preferences
 */
export const filterByTaste = (dishes: DishData[], tasteTags: string[]): DishData[] => {
    if (tasteTags.length === 0) return dishes;

    return dishes.filter(dish =>
        tasteTags.some(tag => dish.tasteTags.includes(tag))
    );
};

/**
 * Filter dishes by cuisine
 */
export const filterByCuisine = (dishes: DishData[], cuisines: string[]): DishData[] => {
    if (cuisines.length === 0) return dishes;

    return dishes.filter(dish =>
        cuisines.some(cuisine => dish.cuisine.includes(cuisine))
    );
};

/**
 * Filter dishes by cooking time
 */
export const filterByCookingTime = (dishes: DishData[], maxMinutes: number): DishData[] => {
    return dishes.filter(dish => {
        const time = parseInt(dish.cookingTime);
        return time <= maxMinutes;
    });
};

/**
 * Filter dishes by difficulty
 */
export const filterByDifficulty = (dishes: DishData[], difficulty: string): DishData[] => {
    return dishes.filter(dish => dish.difficulty === difficulty);
};

/**
 * Filter dishes by protein content
 */
export const filterByProtein = (dishes: DishData[], minProtein: number): DishData[] => {
    return dishes.filter(dish => {
        const protein = parseInt(dish.nutrition.protein);
        return protein >= minProtein;
    });
};

/**
 * Filter dishes by calorie range
 */
export const filterByCalories = (dishes: DishData[], minCal: number, maxCal: number): DishData[] => {
    return dishes.filter(dish => {
        const calories = parseInt(dish.nutrition.calories);
        return calories >= minCal && calories <= maxCal;
    });
};

/**
 * Get random dishes from filtered results
 */
export const getRandomDishes = (dishes: DishData[], count: number): DishData[] => {
    const shuffled = [...dishes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

/**
 * Main function to get personalized meal recommendations
 */
export const getPersonalizedMeals = (preferences: {
    dietaryRestrictions?: string[];
    tastePreferences?: string[];
    cuisinePreferences?: string[];
    maxCookingTime?: number;
    difficulty?: string;
    minProtein?: number;
    calorieRange?: { min: number; max: number };
    count?: number;
}): DishData[] => {
    let filteredDishes = [...MASTER_DISH_DATABASE];

    // Apply dietary filters
    if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
        filteredDishes = filterByDiet(filteredDishes, preferences.dietaryRestrictions);
    }

    // Apply taste filters
    if (preferences.tastePreferences && preferences.tastePreferences.length > 0) {
        filteredDishes = filterByTaste(filteredDishes, preferences.tastePreferences);
    }

    // Apply cuisine filters
    if (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 0) {
        filteredDishes = filterByCuisine(filteredDishes, preferences.cuisinePreferences);
    }

    // Apply cooking time filter
    if (preferences.maxCookingTime) {
        filteredDishes = filterByCookingTime(filteredDishes, preferences.maxCookingTime);
    }

    // Apply difficulty filter
    if (preferences.difficulty) {
        filteredDishes = filterByDifficulty(filteredDishes, preferences.difficulty);
    }

    // Apply protein filter
    if (preferences.minProtein) {
        filteredDishes = filterByProtein(filteredDishes, preferences.minProtein);
    }

    // Apply calorie range filter
    if (preferences.calorieRange) {
        filteredDishes = filterByCalories(
            filteredDishes,
            preferences.calorieRange.min,
            preferences.calorieRange.max
        );
    }

    // Get random selection
    const count = preferences.count || 3;
    return getRandomDishes(filteredDishes, count);
};

/**
 * Get dishes by specific tags
 */
export const getDishesByTags = (tags: {
    dietary?: string[];
    taste?: string[];
    cuisine?: string[];
}): DishData[] => {
    let results = [...MASTER_DISH_DATABASE];

    if (tags.dietary) {
        results = filterByDiet(results, tags.dietary);
    }
    if (tags.taste) {
        results = filterByTaste(results, tags.taste);
    }
    if (tags.cuisine) {
        results = filterByCuisine(results, tags.cuisine);
    }

    return results;
};

/**
 * Search dishes by name
 */
export const searchDishes = (query: string): DishData[] => {
    const lowerQuery = query.toLowerCase();
    return MASTER_DISH_DATABASE.filter(dish =>
        dish.name.toLowerCase().includes(lowerQuery) ||
        dish.description.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Get dishes by meal type (based on name patterns)
 */
export const getDishesByMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): DishData[] => {
    const breakfastKeywords = ['breakfast', 'pancake', 'omelette', 'smoothie', 'oats', 'poha', 'upma', 'idli', 'dosa'];
    const snackKeywords = ['pakora', 'samosa', 'chips', 'balls', 'bites', 'chaat'];

    if (mealType === 'breakfast') {
        return MASTER_DISH_DATABASE.filter(dish =>
            breakfastKeywords.some(keyword => dish.name.toLowerCase().includes(keyword))
        );
    } else if (mealType === 'snack') {
        return MASTER_DISH_DATABASE.filter(dish =>
            snackKeywords.some(keyword => dish.name.toLowerCase().includes(keyword))
        );
    }

    return MASTER_DISH_DATABASE;
};

/**
 * Get high-protein dishes
 */
export const getHighProteinDishes = (): DishData[] => {
    return filterByProtein(MASTER_DISH_DATABASE, 20);
};

/**
 * Get low-calorie dishes
 */
export const getLowCalorieDishes = (): DishData[] => {
    return filterByCalories(MASTER_DISH_DATABASE, 0, 300);
};

/**
 * Get quick meals (under 20 minutes)
 */
export const getQuickMeals = (): DishData[] => {
    return filterByCookingTime(MASTER_DISH_DATABASE, 20);
};

/**
 * Get vegetarian Indian dishes
 */
export const getVegetarianIndianDishes = (): DishData[] => {
    return MASTER_DISH_DATABASE.filter(dish =>
        dish.cuisine.some(c => c.includes('Indian')) &&
        (dish.dietaryTags.includes('Vegetarian') || dish.dietaryTags.includes('Vegan'))
    );
};

/**
 * Get dishes suitable for weight loss
 */
export const getWeightLossDishes = (): DishData[] => {
    return MASTER_DISH_DATABASE.filter(dish => {
        const calories = parseInt(dish.nutrition.calories);
        const fiber = parseInt(dish.nutrition.fiber);
        const protein = parseInt(dish.nutrition.protein);

        return calories < 350 && fiber >= 5 && protein >= 10;
    });
};

/**
 * Get dishes suitable for muscle building
 */
export const getMuscleBuildingDishes = (): DishData[] => {
    return MASTER_DISH_DATABASE.filter(dish => {
        const protein = parseInt(dish.nutrition.protein);
        return protein >= 25;
    });
};

// Export statistics
export const DATABASE_STATS = {
    totalDishes: MASTER_DISH_DATABASE.length,
    indianDishes: INDIAN_DISHES.length,
    internationalDishes: INTERNATIONAL_DISHES.length,
    vegetarianDishes: MASTER_DISH_DATABASE.filter(d => d.dietaryTags.includes('Vegetarian')).length,
    veganDishes: MASTER_DISH_DATABASE.filter(d => d.dietaryTags.includes('Vegan')).length,
    glutenFreeDishes: MASTER_DISH_DATABASE.filter(d => d.dietaryTags.includes('Gluten-Free')).length,
    highProteinDishes: MASTER_DISH_DATABASE.filter(d => parseInt(d.nutrition.protein) >= 20).length,
    quickMeals: MASTER_DISH_DATABASE.filter(d => parseInt(d.cookingTime) <= 20).length,
};

export default MASTER_DISH_DATABASE;
