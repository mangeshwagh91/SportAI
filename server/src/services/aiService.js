const Groq = require('groq-sdk');

class AIService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  // Generate sport recommendations based on user profile
  async getSportRecommendations(userProfile) {
    const { bmi, age, fitnessLevel, goals, bmiCategory } = userProfile;
    
    const prompt = `Based on the following user profile, recommend 5 sports activities:
    
User Profile:
- BMI: ${bmi}
- BMI Category: ${bmiCategory}
- Age: ${age}
- Fitness Level: ${fitnessLevel}
- Goals: ${goals?.join(', ') || 'general fitness'}

Please provide:
1. Sport name
2. Why it's suitable for this user
3. Beginner tips
4. Expected benefits

Format as JSON array with objects containing: name (string), reason (string), tips (string), benefits (string)

IMPORTANT: Return ONLY valid JSON array, no additional text or markdown.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a sports fitness expert. Always respond with valid JSON only, no markdown or extra text." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      let content = response.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(content);
    } catch (error) {
      console.error('AI Sport Recommendations Error:', error.message);
      return this.getFallbackSportRecommendations(userProfile);
    }
  }

  // Generate personalized workout plan
  async generateWorkoutPlan(userProfile, preferences = {}) {
    const { bmi, age, fitnessLevel, goals, bmiCategory } = userProfile;
    const { duration = 45, frequency = '3-4 times week', equipment = 'minimal' } = preferences;

    const prompt = `Create a personalized workout plan for:

User Profile:
- BMI: ${bmi} (${bmiCategory})
- Age: ${age}
- Fitness Level: ${fitnessLevel}
- Goals: ${goals?.join(', ') || 'general fitness'}
- Preferred Duration: ${duration} minutes
- Frequency: ${frequency}
- Equipment: ${equipment}

Provide a detailed workout plan with:
1. Weekly schedule (7 days)
2. Daily exercises with sets, reps, rest times
3. Progress tips
4. Safety considerations for BMI category

Format as JSON with: title (string), description (string), weeklyPlan (array of objects with day and exercises array)

IMPORTANT: Return ONLY valid JSON, no additional text or markdown.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a fitness expert. Always respond with valid JSON only, no markdown or extra text." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      let content = response.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      
      return {
        title: parsed.title || "Personalized Workout Plan",
        description: parsed.description || "A customized fitness routine",
        weeklyPlan: parsed.weeklyPlan || []
      };
    } catch (error) {
      console.error('AI Workout Plan Error:', error.message);
      return this.getFallbackWorkoutPlan(userProfile);
    }
  }

  // Generate personalized diet plan
  async generateDietPlan(userProfile, preferences = {}) {
    const { bmi, age, fitnessLevel, goals, bmiCategory, weight, height, gender } = userProfile;
    const { dietaryRestrictions = [], mealCount = 3 } = preferences;

    console.log('User profile for diet plan:', { weight, height, age, gender, bmi });

    // Calculate BMR and daily calories with validation
    if (!weight || !height || !age) {
      console.warn('Missing weight/height/age, using defaults');
    }
    
    const bmr = this.calculateBMR(weight || 70, height || 170, age || 25, gender || 'male');
    const dailyCalories = this.calculateDailyCalories(bmr, fitnessLevel, goals);
    
    console.log('Calculated BMR:', bmr, 'Daily Calories:', dailyCalories);

    const prompt = `Create a personalized diet plan for:

User Profile:
- BMI: ${bmi} (${bmiCategory})
- Age: ${age}
- Daily Calorie Target: ${dailyCalories}
- Goals: ${goals?.join(', ') || 'maintenance'}
- Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'none'}
- Meals per day: ${mealCount}

Provide:
1. Daily meal plan with calories
2. Macro breakdown as PERCENTAGES (protein/carbs/fats must add up to 100)
3. Shopping list
4. Meal prep tips

Format as JSON with: 
- title (string)
- dailyCalories (number) 
- macros (object with protein, carbs, fats as PERCENTAGE numbers that add up to 100, e.g., {protein: 30, carbs: 40, fats: 30})
- meals (object with breakfast, lunch, dinner, snacks as strings)
- shoppingList (array of strings)

IMPORTANT: Return ONLY valid JSON, no additional text or markdown. Macros must be percentages.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a nutrition expert. Always respond with valid JSON only, no markdown or extra text. Macros should always be percentages that add up to 100." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      let content = response.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(content);
      
      // Validate and normalize macros to ensure they're percentages
      let macros = parsed.macros || { protein: 30, carbs: 40, fats: 30 };
      
      // Check if macros are in valid percentage range
      const total = (macros.protein || 0) + (macros.carbs || 0) + (macros.fats || 0);
      
      // If total is way off (like 170+ suggesting grams), normalize to percentages
      if (total < 80 || total > 120) {
        console.warn('Invalid macro percentages detected, normalizing:', macros);
        const sum = macros.protein + macros.carbs + macros.fats;
        if (sum > 0) {
          macros = {
            protein: Math.round((macros.protein / sum) * 100),
            carbs: Math.round((macros.carbs / sum) * 100),
            fats: Math.round((macros.fats / sum) * 100)
          };
        } else {
          // Use defaults
          macros = { protein: 30, carbs: 40, fats: 30 };
        }
      }
      
      // Ensure the parsed data has the required structure
      return {
        title: parsed.title || "Personalized Diet Plan",
        dailyCalories: parsed.dailyCalories || dailyCalories,
        macros: macros,
        meals: parsed.meals || {},
        shoppingList: parsed.shoppingList || []
      };
    } catch (error) {
      console.error('AI Diet Plan Error:', error.message);
      return this.getFallbackDietPlan(userProfile, dailyCalories);
    }
  }

  // Chat with AI fitness assistant
  async chatWithAI(userProfile, message, chatHistory = []) {
    const { bmi, age, fitnessLevel, goals, bmiCategory } = userProfile;

    const systemPrompt = `You are a professional AI fitness coach. User profile:
- BMI: ${bmi} (${bmiCategory})
- Age: ${age}  
- Fitness Level: ${fitnessLevel}
- Goals: ${goals?.join(', ') || 'general fitness'}

Provide personalized, safe, and encouraging fitness advice. Always consider the user's BMI category for safety recommendations.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-6), // Keep last 6 messages for context
      { role: "user", content: message }
    ];

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 500,
        temperature: 0.8
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Chat Error:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Helper functions
  calculateBMR(weight, height, age, gender) {
    if (gender.toLowerCase() === 'female') {
      return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
    }
    return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
  }

  calculateDailyCalories(bmr, fitnessLevel, goals) {
    let activityMultiplier = 1.2; // sedentary
    
    if (fitnessLevel === 'intermediate') activityMultiplier = 1.55;
    if (fitnessLevel === 'advanced') activityMultiplier = 1.725;

    let baseCalories = bmr * activityMultiplier;

    if (goals?.includes('weight_loss')) baseCalories -= 500;
    if (goals?.includes('weight_gain') || goals?.includes('muscle_gain')) baseCalories += 500;

    return Math.round(baseCalories);
  }

  // Fallback recommendations when AI is unavailable
  getFallbackSportRecommendations(userProfile) {
    const { bmiCategory, age, fitnessLevel } = userProfile;
    
    const recommendations = {
      'Normal weight': [
        { name: 'Swimming', reason: 'Full-body low-impact exercise', tips: 'Start with 20-30 minutes', benefits: 'Cardiovascular health, muscle tone' },
        { name: 'Running', reason: 'Excellent cardio for normal weight individuals', tips: 'Begin with walk-run intervals', benefits: 'Improved endurance, weight maintenance' }
      ],
      'Underweight': [
        { name: 'Weight Training', reason: 'Helps build muscle mass', tips: 'Focus on compound movements', benefits: 'Increased muscle mass, strength' },
        { name: 'Yoga', reason: 'Gentle strength building', tips: 'Try beginner classes', benefits: 'Flexibility, core strength' }
      ],
      'Overweight': [
        { name: 'Walking', reason: 'Low-impact cardio suitable for beginners', tips: 'Start with 30 minutes daily', benefits: 'Weight loss, joint health' },
        { name: 'Cycling', reason: 'Low-impact exercise for larger individuals', tips: 'Use comfortable bike seat', benefits: 'Cardio fitness, leg strength' }
      ],
      'Obese': [
        { name: 'Water Aerobics', reason: 'Joint-friendly full-body workout', tips: 'Join beginner classes', benefits: 'Safe weight loss, improved mobility' },
        { name: 'Chair Exercises', reason: 'Safe starting point for fitness journey', tips: 'Focus on consistency', benefits: 'Initial strength building' }
      ]
    };

    return recommendations[bmiCategory] || recommendations['Normal weight'];
  }

  getFallbackWorkoutPlan(userProfile) {
    const { bmiCategory, fitnessLevel } = userProfile;
    
    return {
      title: `${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)} Fitness Plan`,
      description: `A personalized workout plan for ${bmiCategory} individuals`,
      exercises: [
        { name: "Push-ups", description: "Standard push-ups", sets: 3, reps: "8-12", restTime: 60, muscleGroups: ["chest", "arms"] },
        { name: "Squats", description: "Bodyweight squats", sets: 3, reps: "12-15", restTime: 60, muscleGroups: ["legs"] },
        { name: "Plank", description: "Forearm plank hold", sets: 3, reps: "30-45 seconds", restTime: 45, muscleGroups: ["core"] },
        { name: "Walking", description: "Brisk walking", sets: 1, reps: "30 minutes", restTime: 0, muscleGroups: ["cardio"] },
        { name: "Lunges", description: "Alternating lunges", sets: 3, reps: "10-12 each leg", restTime: 60, muscleGroups: ["legs"] }
      ],
      weeklySchedule: [
        { day: "monday", exerciseIndexes: [0, 1, 2] },
        { day: "wednesday", exerciseIndexes: [3] },
        { day: "friday", exerciseIndexes: [4, 1, 2] }
      ]
    };
  }

  getFallbackDietPlan(userProfile, dailyCalories = 2000) {
    const { bmiCategory, goals } = userProfile;
    
    let title = "Balanced Nutrition Plan";
    let meals = {
      breakfast: "Oatmeal with berries and nuts (400 cal)",
      lunch: "Grilled chicken salad with mixed vegetables and olive oil dressing (500 cal)",
      dinner: "Baked fish with quinoa and steamed broccoli (600 cal)",
      snacks: "Greek yogurt with fruits, handful of almonds (300 cal)"
    };

    // Adjust for BMI category
    if (bmiCategory === 'Underweight') {
      title = "Weight Gain Nutrition Plan";
      dailyCalories += 500;
      meals.snacks = "Protein shake, peanut butter toast, trail mix (500 cal)";
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      title = "Weight Loss Nutrition Plan";
      dailyCalories -= 300;
      meals.dinner = "Grilled chicken breast with large vegetable salad (400 cal)";
    }

    return {
      title,
      dailyCalories,
      macros: { protein: 30, carbs: 40, fats: 30 },
      meals,
      shoppingList: [
        "Oats", "Berries", "Nuts", "Chicken breast", "Fish", 
        "Quinoa", "Vegetables (broccoli, spinach, carrots)", 
        "Greek yogurt", "Olive oil", "Eggs", "Brown rice"
      ]
    };
  }
}

module.exports = new AIService();