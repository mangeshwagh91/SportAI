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

Format as JSON array with objects containing: name, reason, tips, benefits`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Sport Recommendations Error:', error);
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

Format as JSON with: title, description, weeklyPlan (array of days with exercises)`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Workout Plan Error:', error);
      return this.getFallbackWorkoutPlan(userProfile);
    }
  }

  // Generate personalized diet plan
  async generateDietPlan(userProfile, preferences = {}) {
    const { bmi, age, fitnessLevel, goals, bmiCategory, weight, height } = userProfile;
    const { dietaryRestrictions = [], mealCount = 3 } = preferences;

    // Calculate BMR and daily calories
    const bmr = this.calculateBMR(weight, height, age, userProfile.gender || 'male');
    const dailyCalories = this.calculateDailyCalories(bmr, fitnessLevel, goals);

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
2. Macro breakdown (protein/carbs/fats)
3. Shopping list
4. Meal prep tips

Format as JSON with: title, dailyCalories, macros, meals (breakfast, lunch, dinner, snacks), shoppingList`;

    try {
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Diet Plan Error:', error);
      return this.getFallbackDietPlan(userProfile);
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
    return {
      title: "Beginner Fitness Plan",
      description: "A balanced workout plan suitable for beginners",
      weeklyPlan: [
        { day: "Monday", exercises: ["Push-ups: 3 sets of 10", "Squats: 3 sets of 15", "Plank: 3 sets of 30s"] },
        { day: "Wednesday", exercises: ["Walking: 30 minutes", "Stretching: 15 minutes"] },
        { day: "Friday", exercises: ["Lunges: 3 sets of 12", "Wall sits: 3 sets of 30s", "Basic yoga: 20 minutes"] }
      ]
    };
  }

  getFallbackDietPlan(userProfile) {
    return {
      title: "Balanced Nutrition Plan",
      dailyCalories: 2000,
      macros: { protein: 25, carbs: 45, fats: 30 },
      meals: {
        breakfast: "Oatmeal with berries and nuts",
        lunch: "Grilled chicken salad with vegetables",
        dinner: "Baked fish with quinoa and steamed broccoli"
      },
      shoppingList: ["Oats", "Berries", "Nuts", "Chicken", "Fish", "Quinoa", "Vegetables"]
    };
  }
}

module.exports = new AIService();