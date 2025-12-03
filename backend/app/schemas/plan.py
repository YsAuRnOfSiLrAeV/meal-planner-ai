from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field


class Nutrition(BaseModel):
	calories: Optional[float] = None
	proteins_g: Optional[float] = None
	fats_g: Optional[float] = None
	carbohydrates_g: Optional[float] = None
	fiber_g: Optional[float] = None
	calcium_mg: Optional[float] = None
	iron_mg: Optional[float] = None
	magnesium_mg: Optional[float] = None
	potassium_mg: Optional[float] = None
	zinc_mg: Optional[float] = None
	phosphorus_mg: Optional[float] = None
	vitamins: Optional[Dict[str, float]] = None


class IngredientCountable(BaseModel):
	type: Optional[str] = Field(default="COUNTABLE")
	name: str
	quantity: Optional[float] = None
	nutritionPerUnit: Optional[Nutrition] = None


class IngredientUncountable(BaseModel):
	type: Optional[str] = Field(default="UNCOUNTABLE")
	name: str
	mass_g: Optional[float] = None
	nutritionPer100g: Optional[Nutrition] = None


Ingredient = Union[IngredientCountable, IngredientUncountable]


class Meal(BaseModel):
	mealNumber: int
	name: str
	ingredients: List[Ingredient] = []
	nutrition: Optional[Nutrition] = None


class DietDay(BaseModel):
	dayNumber: int
	meals: List[Meal] = []
	nutrition: Optional[Nutrition] = None


class DietPlan(BaseModel):
	aim: str
	preparationStyle: str
	days: List[DietDay]
	nutrition: Optional[Nutrition] = None


class GenerateRequest(BaseModel):
	gender: Optional[str] = None
	age: Optional[int] = None
	bodyMass: Optional[float] = None
	leanBodyMass: Optional[float] = None
	allergies: Optional[str] = None
	aim: Optional[str] = None
	lifestyle: Optional[str] = None
	preparationStyle: Optional[str] = None
