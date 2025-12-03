// Firebase Analytics Event Tracking Utility
// This file provides helper functions to log custom events to Google Analytics (GA4)

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config' | 'js',
            targetId: string | Date,
            config?: Record<string, any>
        ) => void;
    }
}

/**
 * Log a custom event to Google Analytics
 * @param eventName - The name of the event
 * @param eventParams - Optional parameters for the event
 */
export const logAnalyticsEvent = (
    eventName: string,
    eventParams?: Record<string, any>
) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
        console.log(`Analytics Event: ${eventName}`, eventParams);
    } else {
        console.warn('Google Analytics not initialized');
    }
};

/**
 * Log when a user generates meal recommendations
 */
export const logMealGeneration = (preferences: {
    tastes?: string[];
    dietaryRestrictions?: string[];
    cuisines?: string[];
}) => {
    logAnalyticsEvent('generate_meals', {
        event_category: 'Meal Planning',
        event_label: 'AI Meal Generation',
        tastes: preferences.tastes?.join(', ') || 'none',
        dietary_restrictions: preferences.dietaryRestrictions?.join(', ') || 'none',
        cuisines: preferences.cuisines?.join(', ') || 'varied',
    });
};

/**
 * Log when a user logs a meal to their history
 */
export const logMealLogged = (mealName: string, calories?: string) => {
    logAnalyticsEvent('log_meal', {
        event_category: 'Nutrition Tracking',
        event_label: 'Meal Logged',
        meal_name: mealName,
        calories: calories || 'unknown',
    });
};

/**
 * Log when a user adds items to grocery list
 */
export const logGroceryItemsAdded = (itemCount: number, source: string) => {
    logAnalyticsEvent('add_to_grocery_list', {
        event_category: 'Grocery Planning',
        event_label: 'Items Added to List',
        item_count: itemCount,
        source: source, // e.g., 'meal_recommendation', 'manual_entry'
    });
};

/**
 * Log when a user uses the Healthy Swap feature
 */
export const logHealthySwap = (swapCount: number) => {
    logAnalyticsEvent('healthify_recipe', {
        event_category: 'Recipe Optimization',
        event_label: 'Healthy Swap Made',
        swap_count: swapCount,
    });
};

/**
 * Log when a user exports meals
 */
export const logMealExport = () => {
    logAnalyticsEvent('export_meals', {
        event_category: 'Data Export',
        event_label: 'Meals Exported',
    });
};

/**
 * Log when a user exports grocery list
 */
export const logGroceryExport = () => {
    logAnalyticsEvent('export_grocery_list', {
        event_category: 'Data Export',
        event_label: 'Grocery List Exported',
    });
};

/**
 * Log when a user updates their preferences
 */
export const logPreferencesUpdated = (preferenceType: string) => {
    logAnalyticsEvent('update_preferences', {
        event_category: 'User Settings',
        event_label: 'Preferences Updated',
        preference_type: preferenceType,
    });
};
