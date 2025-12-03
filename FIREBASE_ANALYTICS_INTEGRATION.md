# Firebase Analytics Integration - SmartEats

## Overview
This document describes the Firebase Analytics (GA4) integration implemented in the SmartEats application to track user actions and engagement.

## Implementation Summary

### 1. Analytics Utility (`src/lib/analytics.ts`)
Created a centralized analytics utility file that provides helper functions for logging custom events to Google Analytics (GA4).

### 2. Events Being Tracked

#### **Meal Generation** (`generate_meals`)
- **Triggered when**: User generates AI-powered meal recommendations
- **Event Category**: Meal Planning
- **Parameters tracked**:
  - `tastes`: User's taste preferences (e.g., "Sweet, Spicy")
  - `dietary_restrictions`: User's dietary restrictions (e.g., "Vegetarian, Gluten-Free")
  - `cuisines`: User's cuisine preferences (e.g., "Italian, Asian")
- **Component**: `MealRecommendations.tsx`

#### **Log Meal** (`log_meal`)
- **Triggered when**: User logs a meal to their nutrition history
- **Event Category**: Nutrition Tracking
- **Parameters tracked**:
  - `meal_name`: Name of the meal being logged
  - `calories`: Calorie content of the meal
- **Component**: `MealRecommendations.tsx`

#### **Add to Grocery List** (`add_to_grocery_list`)
- **Triggered when**: User adds items to their grocery list
- **Event Category**: Grocery Planning
- **Parameters tracked**:
  - `item_count`: Number of items added
  - `source`: Source of the items (`meal_recommendation` or `manual_entry`)
- **Components**: 
  - `MealRecommendations.tsx` (from meal ingredients)
  - `GroceryListSection.tsx` (manual entry)

#### **Healthify Recipe** (`healthify_recipe`)
- **Triggered when**: User uses the Healthy Swap feature to optimize a recipe
- **Event Category**: Recipe Optimization
- **Parameters tracked**:
  - `swap_count`: Number of healthy substitutions made
- **Component**: `HealthySwap.tsx`

#### **Export Meals** (`export_meals`)
- **Triggered when**: User exports meal recommendations
- **Event Category**: Data Export
- **Component**: `MealRecommendations.tsx`

#### **Export Grocery List** (`export_grocery_list`)
- **Triggered when**: User exports their grocery list
- **Event Category**: Data Export
- **Component**: `GroceryListSection.tsx`

#### **Update Preferences** (`update_preferences`)
- **Triggered when**: User updates their food preferences
- **Event Category**: User Settings
- **Parameters tracked**:
  - `preference_type`: Type of preference updated (e.g., "food_preferences")
- **Component**: `UserPreferencesDialog.tsx`

## Viewing Events in Firebase Console

### Steps to View Events:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Analytics** → **Events**
4. You should see all the custom events listed above

### Real-time Debugging:
1. In Firebase Console, go to **Analytics** → **DebugView**
2. Events will appear in real-time as users interact with your app
3. You can see event parameters and user properties

## Event Categories in Firebase

All events are organized into the following categories:
- **Meal Planning**: Events related to meal generation and recommendations
- **Nutrition Tracking**: Events related to logging meals and tracking nutrition
- **Grocery Planning**: Events related to grocery list management
- **Recipe Optimization**: Events related to the Healthy Swap feature
- **Data Export**: Events related to exporting data
- **User Settings**: Events related to user preferences

## Testing Analytics

To test if analytics is working:

1. **Open Browser Console**: Open your app and check the browser console for analytics logs
2. **Check DebugView**: Use Firebase DebugView for real-time event monitoring
3. **Verify Events**: Perform actions in the app and verify they appear in Firebase Events tab (may take 24-48 hours for non-debug events)

## Code Structure

### Analytics Utility Functions
```typescript
// Core logging function
logAnalyticsEvent(eventName, eventParams)

// Specific event functions
logMealGeneration(preferences)
logMealLogged(mealName, calories)
logGroceryItemsAdded(itemCount, source)
logHealthySwap(swapCount)
logMealExport()
logGroceryExport()
logPreferencesUpdated(preferenceType)
```

### Integration Pattern
Each component imports the relevant analytics functions:
```typescript
import { logMealGeneration, logMealLogged } from '@/lib/analytics';
```

And calls them at the appropriate action points:
```typescript
// After successful action
logMealGeneration({
  tastes: preferences.tastes,
  dietaryRestrictions: preferences.dietaryRestrictions,
  cuisines: preferences.cuisines,
});
```

## Benefits of This Implementation

1. **Centralized**: All analytics logic is in one place (`analytics.ts`)
2. **Type-safe**: TypeScript ensures correct parameter types
3. **Maintainable**: Easy to add new events or modify existing ones
4. **Debuggable**: Console logs help with development and debugging
5. **Non-intrusive**: Analytics calls don't interfere with app functionality

## Future Enhancements

Potential additional events to track:
- User authentication events (login, signup, logout)
- Search queries in meal recommendations
- Filter usage in grocery lists
- Recipe view duration
- User engagement metrics (time on page, scroll depth)
- Error tracking and user feedback

## Notes

- Events are logged to Google Analytics with the measurement ID: `G-5BD4DRZXJL`
- All events include automatic parameters from GA4 (user_id, session_id, etc.)
- Custom parameters help segment and analyze user behavior
- Events may take 24-48 hours to appear in standard reports (use DebugView for real-time)
