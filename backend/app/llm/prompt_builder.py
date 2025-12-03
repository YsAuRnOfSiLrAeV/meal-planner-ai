from app.schemas.plan import GenerateRequest


def build_prompt(req: GenerateRequest) -> str:
	instructions = f"""
Ingredients example:
- Grains: wheat, oats, corn, rice, buckwheat, pasta, lentils (orange, green, black), barley, bulgur, couscous, etc.
- Vegetables: potato, carrot, onion, tomato, cucumber, pepper, garlic, beetroot, spinach, avocado, etc.
- Fruits/berries: orange, apple, banana, peach, pear, melon, strawberry, raspberry, blackberry, etc.
- Meat/fish/animal products: egg, chicken, beef, lamb, pork, turkey, rabbit, carp, salmon, tilapia, mackerel, shrimp, etc.
- Milk products: milk, cottage cheese, cheese(gouda, mozzarella, feta), butter, cream, sour cream, etc.
- Oils and fats: sunflower oil, olive oil, coconut oil, etc.
- Bread and bakery products: bread, lavash, buns, tortillas, etc.
- Other: sugar, salt, nuts(almond, hazelnut, cashew, etc.), mushrooms, various types of spices, etc.

Dishes example:
- Examples of ready quick meal: Cottage cheese with bananas and tea; Bulgur with boiled chicken breast; Milk porridge of buckwheat; Pasta with fried eggs; Mashed potatoes with fried beef and vegetable salad; Burger; Omelet with tomatoes and cheese; Rice with tuna and cucumber; Scrambled eggs with sausage and toast; Yogurt with granola and berries; Tortilla wrap with chicken and vegetables; Sandwich with ham, cheese, and lettuce; Tuna salad with corn, beans, and onion; Omelet with turkey and spinach; etc.
- Examples of ready elaborate meal: Lasagna; Borshch with sour cream; Vareniki; Spaghetti Bolognese; Beef Stroganoff with egg noodles; Chicken Parmesan with mozzarella and tomato sauce; Barbecue ribs with baked beans; Shrimp jambalaya with rice; Turkey or beef meatloaf with mashed potatoes; Baked cod with lentil salad; Shrimp stir-fry with broccoli and bell peppers; Chili con carne with beans and beef; Plov; Smoked salmon tartare with eggs; etc.

How to generate diet plan:
- Firstly, you must apply formulas for target calories and macros and maintain it in all calculations, because this is the main feature of the diet plan.
- Secondly, you must remember to respect preparationStyle rules.
- And only after that you can start generating the diet plan.
- After generating the diet plan, you MUST thoroughly validate it against formulas for target calories, fats, carbs and proteins. If at least one parameter is wrong, you MUST increase or decrease grams of ingredients in dishes evenly throughout the day that can influence on that metric that have wrong quantity. If you are unable to do this, you MUST REGENERATE the whole diet plan from scratch until it is correct and only then return JSON!

General mandatory instructions for the AI:
- You are an expert in nutrition and meal planning.
- You create detailed meal plans based on the user's metrics.
- You must thoroughly validate outputs against nutrition and dietetics rules.
- Nutrition must be balanced, varied, and aligned with the user's goal.
- You must respond in JSON, strictly following the template below. Return pure JSON only (no code fences, no comments).
- For nutrition, no fixed vitamin list is provided; include any vitamins you deem relevant as a map (vitamin name -> amount in mg).
- Take as much time as needed for generation and validation; quality is the priority.
- Build a meal plan for 1 week, 7 days per week.
- Do NOT repeat garnishes (e.g., rice, potatoes, pasta, lentils) day to day, use different garnishes for different meals.
- Do NOT repeat Meat/fish/animal products day to day, use different garnishes for different meals.
- Do NOT repeat meals and ingredients day to day on the same places. Rotate and change meals and ingredients.
- AVOID fish dishes on two consecutive days. Try to make fish dishes no more than three times a week. It is better to make more meat and poultry dishes.
- Avoid duplicates: meals must be unique within a day; within a week fully same meal may repeat at most 3 times; across weeks rotate variants. Do not reuse identical nutrition blocks.
- Do not output a single example day. Always generate the full 7-day plan in one JSON response. Partial or demo outputs are not allowed. Your answer is invalid if it contains fewer than 7 days. Always return exactly 7 days, fully filled, in one JSON.
- If the output does not contain exactly 7 days, each with 4 meals, treat the response as incorrect and regenerate until the condition is satisfied
- Names of dishes should be short and strict (without explanations or adjectives), example: "Oatmeal with berries", "Grilled chicken with vegetables", "Vegetable soup", "Fruit salad", "Milk porridge", etc.
- If allergies are specified, do NOT use ingredients that may contain the allergen or are related to it (e.g., for "nuts" avoid all nuts and seeds, for "gluten" avoid wheat, barley, rye, etc.)! If allergies == null: use any ingredients.

Ingredient state and nutrition rules:
- Use only prepared/cooked foods; always provide nutrition for the prepared state.
- For grains/pasta/rice/couscous/bulgur/barley/quinoa: use cooked versions only and provide nutritionPer100g for cooked.
- For meats/fish/eggs/vegetables: use cooked/baked/boiled/grilled state; include the state in the name (e.g., "chicken breast, cooked", "potatoes, boiled").
- Do not use raw/dry weights. Do not mix raw and cooked for the same ingredient across the week.
- Every ingredient must have accurate nutritionPer100g (UNCOUNTABLE) or nutritionPerUnit (COUNTABLE) based on the prepared product; no placeholders or zeros.
- Oils/butter/sauces must be separate ingredients with explicit grams (no “to taste”).

General optional instructions for the AI:
- You can combine dishes into one: borscht with sour cream + bread, cottage cheese with banana + eggs, etc.
- You can use the same ingredient in different meals within a day, but not in the same meal.
- You may use examples of ingredients that I provided, but you can also create your own ingredients or take them from your knowledge base or internet.
- you may use my examples of dishes that I provided, but you can also create your own dishes or take them from your knowledge base or internet.
- You can use any cuisine, but avoid exotic or rare ingredients.
- You can use any cooking methods, but avoid raw-only meals (except salads and snacks).
- You can make one dessert a day, but you can also go without dessert.

Instructions about metrics and JSON structure:
- The JSON includes two ingredient types: COUNTABLE (discrete items) and UNCOUNTABLE (measured by weight). "COUNTABLE" must include quantity and nutritionPerUnit; "UNCOUNTABLE" must include mass_g and nutritionPer100g.
- Number of weeks: 1.
- Number of days per week: 7 - fill them all.
- Meals per day are 4 for all aims (weight goals).
- Each meal must contain 1-7 ingredients.
- Do not use generic or "mixed" ingredients. Use concrete items (e.g., egg, chicken breast, rice, broccoli, loaf of bread, etc.). If an ingredient is measured in grams, it must be UNCOUNTABLE with mass_g and nutritionPer100g. If an ingredient is measured in units, it must be COUNTABLE with quantity and nutritionPerUnit.
- For UNCOUNTABLE ingredients: mass_g must be within 1-500. Per-meal total mass should be within 200-1200.
- All numeric fields must be numbers (no quotes).

Instructions about nutrition:
- Daily calories and macros must be within 8 percent of the target.
- Weekly calories and macros must be within 4 percent of the target.
- Respect preparation style rules:
 - QUICK: use simple, fast recipes; max 15-25 minutes per meal; minimal steps. You can use my examples of quick meals, but you can also create your own quick meals or take them from your knowledge base or internet.
 - ELABORATE: allow complex recipes; 30-90 minutes per meal; richer textures and taste. You can use my examples of elaborate meals, but you can also create your own elaborate meals or take them from your knowledge base or internet.
- You MUST follow target CPFC, that is stated after user parameters, while planning nutrition and validation.

Instruction for units of measurement:
- Calories must be in kcal.
- Protein, fats and carbs must be in grams.
- Fiber must be in grams.
- Calcium must be in milligrams.
- Iron must be in milligrams.
- Magnesium must be in milligrams.
- Potassium must be in milligrams.
- Zinc must be in milligrams.
- Phosphorus must be in milligrams.
- Vitamins must be in milligrams.

Instruction for vitamins format:
- Vitamins must be a JSON object (map): keys = vitamin names (letters/digits, lowercase), values = numbers in mg.
- Examples: {{ "c": 8.7, "b12": 0.0003, "d3": 0.01 }}
- There can be several vitamins in product, including none.
- Take main vitamins of the product, do not invent or add extra vitamins.

User parameters:
- gender: {req.gender}
- age: {req.age}
- bodyMass: {req.bodyMass}
- leanBodyMass: {req.leanBodyMass}
- allergies: {"none" if not req.allergies else req.allergies}
- aim: {req.aim}  # WEIGHT_LOSS | WEIGHT_MAINTAIN | WEIGHT_GAIN
- lifestyle: {req.lifestyle}  # NOT_ACTIVE | MODERATELY_ACTIVE | ACTIVE
- preparationStyle: {req.preparationStyle}

Target CPFC - use exactly these values:
{_cpfc_counter(req)}

Return EXACTLY JSON matching this template (no additional commentary):
"""

	json_template = """
{
	"preparationStyle": "QUICK | ELABORATE",
	"days": [
	{
		"dayNumber": number,
		"meals": [
		{
			"mealNumber": number,
			"name": "Meal Name",
			"ingredients": [
			{
				"type": "COUNTABLE",
				"name": "Ingredient Name",
				"quantity": number,
				"nutritionPerUnit": {
				"calories": number,
				"proteins_g": number,
				"fats_g": number,
				"carbohydrates_g": number,
				"fiber_g": number,
				"calcium_mg": number,
				"iron_mg": number,
				"magnesium_mg": number,
				"potassium_mg": number,
				"zinc_mg": number,
				"phosphorus_mg": number,
				"vitamins": { "vitamin name": number }
				}
			},
			{
				"type": "UNCOUNTABLE",
				"name": "Ingredient Name",
				"mass_g": number,
				"nutritionPer100g": {
				"calories": number,
				"proteins_g": number,
				"fats_g": number,
				"carbohydrates_g": number,
				"fiber_g": number,
				"calcium_mg": number,
				"iron_mg": number,
				"magnesium_mg": number,
				"potassium_mg": number,
				"zinc_mg": number,
				"phosphorus_mg": number,
				"vitamins": { "vitamin name": number }
				}
			}
			]
		}
		]
	}
	]
}
"""
	return instructions + "\n" + json_template


def _cpfc_counter(r: GenerateRequest) -> str:
    aim = (r.aim or "").upper()
    lifestyle = (getattr(r, "lifestyle", "") or "").upper()
    try:
        age = int(getattr(r, "age", 0) or 0)
    except (TypeError, ValueError):
        age = 0

    def asf(x: float | None) -> float:
        return float(x or 0.0)

    lean = asf(r.leanBodyMass)

    bmr = 370 + 21.6 * lean

    if age <= 0 or age < 60:
        age_factor = 1.0
    else:
        decline = 0.007 * (age - 60)
        if decline > 0.26:
            decline = 0.26
        age_factor = 1.0 - decline

    if lifestyle == "NOT_ACTIVE":
        activity_factor = 1.2
    elif lifestyle == "MODERATELY_ACTIVE":
        activity_factor = 1.55
    elif lifestyle == "ACTIVE":
        activity_factor = 1.725
    else:
        activity_factor = 1.4

    tdee = bmr * activity_factor * age_factor

    if aim == "WEIGHT_LOSS":
        calories = tdee * 0.85
    elif aim == "WEIGHT_GAIN":
        calories = tdee * 1.15
    else:
        calories = tdee

    if lifestyle == "NOT_ACTIVE":
        base_protein_per_kg_lean = 1.0
    elif lifestyle == "MODERATELY_ACTIVE":
        base_protein_per_kg_lean = 1.2
    else:
        base_protein_per_kg_lean = 1.4

    if aim == "WEIGHT_LOSS":
        protein_per_kg_lean = base_protein_per_kg_lean + 0.4
    elif aim == "WEIGHT_GAIN":
        protein_per_kg_lean = base_protein_per_kg_lean + 0.2
    else:
        protein_per_kg_lean = base_protein_per_kg_lean

    if age >= 65:
        protein_per_kg_lean *= 1.10

    proteins = lean * protein_per_kg_lean

    if aim == "WEIGHT_LOSS":
        fat_percent = 0.25
    elif aim == "WEIGHT_GAIN":
        fat_percent = 0.30
    else:
        fat_percent = 0.28

    fats = calories * fat_percent / 9.0

    carbs = (calories - (proteins * 4 + fats * 9)) / 4.0

    return f"""- targetCalories: {calories:.0f}
- targetProteins_g: {proteins:.1f}
- targetFats_g: {fats:.1f}
- targetCarbohydrates_g: {carbs:.1f}
"""