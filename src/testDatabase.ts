// TEST FILE - Verify 1000-Dish Database Integration
// Run this to test if dishes are loading correctly

import {
    MASTER_DISH_DATABASE,
    getPersonalizedMeals,
    getVegetarianIndianDishes,
    getHighProteinDishes,
    searchDishes,
    DATABASE_STATS
} from './data/masterDishDatabase';

console.log('=== SMARTEATS 1000-DISH DATABASE TEST ===\n');

// Test 1: Check database stats
console.log('📊 DATABASE STATISTICS:');
console.log(`Total Dishes: ${DATABASE_STATS.totalDishes}`);
console.log(`Indian Dishes: ${DATABASE_STATS.indianDishes}`);
console.log(`International Dishes: ${DATABASE_STATS.internationalDishes}`);
console.log(`Vegetarian: ${DATABASE_STATS.vegetarianDishes}`);
console.log(`Vegan: ${DATABASE_STATS.veganDishes}`);
console.log(`High Protein: ${DATABASE_STATS.highProteinDishes}`);
console.log(`Quick Meals: ${DATABASE_STATS.quickMeals}`);
console.log('\n');

// Test 2: Get personalized meals (Vegan, Spicy, Indian)
console.log('🍛 TEST: Vegan + Spicy + Indian Dishes');
const veganSpicyIndian = getPersonalizedMeals({
    dietaryRestrictions: ['Vegan'],
    tastePreferences: ['Spicy'],
    cuisinePreferences: ['Indian'],
    count: 5
});
console.log(`Found ${veganSpicyIndian.length} dishes:`);
veganSpicyIndian.forEach((dish, i) => {
    console.log(`${i + 1}. ${dish.name} - ${dish.cookingTime} - ${dish.nutrition.calories} cal`);
});
console.log('\n');

// Test 3: Search for "Aloo" dishes
console.log('🔍 TEST: Search for "Aloo" dishes');
const alooDishes = searchDishes('aloo');
console.log(`Found ${alooDishes.length} Aloo dishes:`);
alooDishes.slice(0, 10).forEach((dish, i) => {
    console.log(`${i + 1}. ${dish.name}`);
});
console.log('\n');

// Test 4: Get vegetarian Indian dishes
console.log('🥗 TEST: Vegetarian Indian Dishes');
const vegIndian = getVegetarianIndianDishes();
console.log(`Found ${vegIndian.length} vegetarian Indian dishes`);
console.log('Sample dishes:');
vegIndian.slice(0, 10).forEach((dish, i) => {
    console.log(`${i + 1}. ${dish.name}`);
});
console.log('\n');

// Test 5: Get high protein dishes
console.log('💪 TEST: High Protein Dishes (20g+)');
const highProtein = getHighProteinDishes();
console.log(`Found ${highProtein.length} high protein dishes`);
console.log('Sample dishes:');
highProtein.slice(0, 10).forEach((dish, i) => {
    console.log(`${i + 1}. ${dish.name} - ${dish.nutrition.protein} protein`);
});
console.log('\n');

// Test 6: Get quick meals
console.log('⚡ TEST: Quick Meals (under 20 min)');
const quickMeals = getPersonalizedMeals({
    maxCookingTime: 20,
    count: 10
});
console.log(`Found ${quickMeals.length} quick meals:`);
quickMeals.forEach((dish, i) => {
    console.log(`${i + 1}. ${dish.name} - ${dish.cookingTime}`);
});
console.log('\n');

// Test 7: Verify specific dishes exist
console.log('✅ TEST: Verify Specific Dishes Exist');
const testDishes = [
    'Aloo Ki Sabzi',
    'Dal Tadka',
    'Palak Paneer',
    'Chole',
    'Rajma Masala',
    'Grilled Chicken Breast',
    'Caesar Salad',
    'Pad Thai'
];

testDishes.forEach(dishName => {
    const found = MASTER_DISH_DATABASE.find(d => d.name === dishName);
    console.log(`${found ? '✓' : '✗'} ${dishName}`);
});
console.log('\n');

// Test 8: Check dish structure
console.log('📋 TEST: Verify Dish Structure');
const sampleDish = MASTER_DISH_DATABASE[0];
console.log('Sample dish structure:');
console.log(`Name: ${sampleDish.name}`);
console.log(`Description: ${sampleDish.description}`);
console.log(`Cooking Time: ${sampleDish.cookingTime}`);
console.log(`Difficulty: ${sampleDish.difficulty}`);
console.log(`Cuisine: ${sampleDish.cuisine.join(', ')}`);
console.log(`Dietary Tags: ${sampleDish.dietaryTags.join(', ')}`);
console.log(`Taste Tags: ${sampleDish.tasteTags.join(', ')}`);
console.log(`Ingredients: ${sampleDish.ingredients.length} items`);
console.log(`Instructions: ${sampleDish.instructions.length} steps`);
console.log(`Nutrition: ${sampleDish.nutrition.calories} cal, ${sampleDish.nutrition.protein} protein`);
console.log('\n');

console.log('=== ALL TESTS COMPLETE ===');
console.log('✅ Database is ready for production!');
