# SmartEats

> **AI-powered meal planning and nutrition tracking — personalized to you.**

**[smart-eats.in](https://smart-eats.in/)**

![Users](https://img.shields.io/badge/Users-6k%2B-brightgreen)
![Meals Generated](https://img.shields.io/badge/Meals%20Generated-30k%2B-blue)

---

## Overview

SmartEats is a full-stack web application that uses Google Gemini AI to generate personalized meal recommendations based on your dietary restrictions, taste preferences, available ingredients, and cooking time. It also tracks your daily nutrition intake, manages grocery lists, and suggests healthy food swaps.

---

## Features

- **AI Meal Recommendations** — Generates tailored meal suggestions powered by Google Gemini 1.5 Flash
- **Nutrition Tracker** — Logs daily macro and micronutrient intake (vitamins, minerals, protein, carbs, fat)
- **Meal History** — Records eaten meals with full nutritional data and personal ratings
- **Grocery Lists** — Creates and manages shopping lists with persistent storage
- **Healthy Swaps** — Suggests healthier ingredient alternatives for existing recipes
- **User Preferences** — Stores dietary restrictions, allergens, taste preferences, and cooking habits
- **Dark / Light Mode** — System-aware theme with manual toggle
- **Responsive Design** — Mobile-friendly UI optimized for all screen sizes

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool (SWC compiler) |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| shadcn/ui | — | Pre-built accessible components (49 components via Radix UI) |
| React Router DOM | 6.30.1 | Client-side routing |
| TanStack Query | 5.83.0 | Server state management |
| React Hook Form | 7.61.1 | Form handling |
| Zod | 3.25.76 | Schema validation |
| Lucide React | 0.462.0 | Icon library |
| Sonner | 1.7.4 | Toast notifications |
| next-themes | 0.3.0 | Theme management |
| date-fns | 3.6.0 | Date utilities |

### Backend & Infrastructure

| Technology | Purpose |
|---|---|
| Supabase | Backend-as-a-service (PostgreSQL, Auth, Edge Functions, RLS) |
| Deno | Runtime for Supabase Edge Functions |
| Google Gemini 1.5 Flash | AI model for meal generation |
| Google Analytics 4 | Usage analytics and event tracking |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser (React)                 │
│  LandingPage → AuthPage → Dashboard             │
│     ├── MealRecommendations                     │
│     ├── NutritionTracker                        │
│     ├── MealHistory                             │
│     ├── GroceryListSection                      │
│     └── HealthySwap                             │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────┐
│               Supabase Platform                  │
│                                                  │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐ │
│  │   Auth   │  │ PostgreSQL │  │  Edge Func  │ │
│  │(email/pw)│  │  (RLS on  │  │ (Deno/TS)   │ │
│  │          │  │ all tables)│  │             │ │
│  └──────────┘  └────────────┘  └──────┬──────┘ │
└───────────────────────────────────────┼─────────┘
                                        │ REST
                          ┌─────────────▼──────────┐
                          │  Google Gemini 1.5 Flash │
                          │    (meal generation)     │
                          └────────────────────────--┘
```

---

## Database Schema

All tables have Row Level Security (RLS) enabled — users can only access their own data.

### `profiles`
Stores user identity, created automatically on signup via a database trigger.

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | References `auth.users` |
| email | TEXT | User email |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| created_at / updated_at | TIMESTAMPTZ | Auto-managed |

### `user_preferences`
Dietary and cooking preferences per user.

| Column | Type | Description |
|---|---|---|
| dietary_restrictions | TEXT[] | e.g. vegetarian, vegan, keto |
| taste_preferences | TEXT[] | e.g. spicy, sweet, savory |
| cooking_time_preference | TEXT | quick / medium / long |
| ingredients_available | TEXT[] | Pantry items |
| allergens | TEXT[] | Allergy list |

### `meal_history`
Log of meals eaten by the user.

| Column | Type | Description |
|---|---|---|
| meal_name | TEXT | Name of the meal |
| meal_description | TEXT | Description |
| calories | NUMERIC | Total calories |
| protein / carbs / fat / fiber | NUMERIC | Macronutrients |
| vitamins / minerals | JSONB | Micronutrients |
| cooked_at | TIMESTAMPTZ | When the meal was eaten |
| rating | INTEGER | User rating (1–5) |

### `grocery_lists`
Shopping lists stored as JSONB arrays.

| Column | Type | Description |
|---|---|---|
| name | TEXT | List name |
| items | JSONB | Array of grocery items |

### `nutrient_intake`
Daily aggregated nutrient tracking with a unique constraint per user per date.

| Column | Type | Description |
|---|---|---|
| date | DATE | Tracking date |
| vitamins | JSONB | A, C, D, E, K, B1–B12, folate |
| minerals | JSONB | Calcium, iron, magnesium, potassium, zinc, etc. |
| total_calories / protein / carbs / fat | NUMERIC | Daily macros |

---

## AI Meal Generation Workflow

Meal suggestions are generated via a **Supabase Edge Function** (`generate-meal-suggestions`) running on Deno.

**Request payload:**
```json
{
  "dietary_preferences": "vegetarian",
  "allergies": "nuts",
  "cuisine_preference": "Indian",
  "meal_type": "lunch",
  "cooking_time": "30 minutes",
  "difficulty_level": "easy",
  "available_ingredients": "rice, lentils, tomatoes"
}
```

**Response:**
```json
{
  "success": true,
  "mealSuggestions": [
    {
      "name": "Dal Tadka",
      "description": "...",
      "cookingTime": "25 min",
      "difficulty": "easy",
      "ingredients": ["..."],
      "instructions": ["..."],
      "nutrition": {
        "calories": 320,
        "protein": "14g",
        "highlights": ["High fiber", "Iron-rich"]
      },
      "whyRecommended": "Matches your preference for quick vegetarian meals."
    }
  ]
}
```

The edge function calls the **Google Gemini 1.5 Flash** API with a structured prompt built from the user's preferences, then parses and returns the JSON response to the frontend.

---

## Auth Flow

1. User signs up with email, password, first name, and last name
2. Supabase Auth creates the user in `auth.users`
3. A database trigger automatically creates rows in `profiles` and `user_preferences`
4. Sessions are persisted in `localStorage` with auto token refresh
5. All authenticated routes are protected via an auth state listener in `Index.tsx`

---

## Project Structure

```
SmartEats/
├── src/
│   ├── components/
│   │   ├── ui/                    # 49 shadcn/ui components
│   │   ├── AuthPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LandingPage.tsx
│   │   ├── MealRecommendations.tsx
│   │   ├── HealthySwap.tsx
│   │   ├── NutritionTracker.tsx
│   │   ├── GroceryListSection.tsx
│   │   ├── UserPreferencesDialog.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Footer.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx        # Dark/light mode context
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── integrations/supabase/
│   │   ├── client.ts              # Supabase client
│   │   └── types.ts               # Auto-generated DB types
│   ├── lib/
│   │   ├── utils.ts
│   │   └── analytics.ts           # GA4 event tracking
│   └── pages/
│       ├── Index.tsx              # Entry point with auth routing
│       └── NotFound.tsx
├── supabase/
│   ├── config.toml
│   ├── migrations/                # SQL migration files
│   └── functions/
│       └── generate-meal-suggestions/
│           └── index.ts           # Deno edge function
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com/) project
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)

### Setup

```bash
# Clone the repository
git clone https://github.com/erensh27/smarteats.git
cd smarteats

# Install dependencies
npm install

# Create a .env file with your Supabase credentials
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# Start the development server (port 8080)
npm run dev
```

### Edge Function

Set the `GEMINI_API_KEY` secret in your Supabase project dashboard, then deploy the function:

```bash
supabase functions deploy generate-meal-suggestions
```

### Available Scripts

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Live App

**[https://smart-eats.in/](https://smart-eats.in/)**
