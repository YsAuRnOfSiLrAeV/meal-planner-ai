/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"

type Vitamins = Record<string, number>;
type Nutrition = {
  calories?: number;
  proteins_g?: number;
  fats_g?: number;
  carbohydrates_g?: number;
  fiber_g?: number;
  calcium_mg?: number;
  iron_mg?: number;
  magnesium_mg?: number;
  potassium_mg?: number;
  zinc_mg?: number;
  phosphorus_mg?: number;
  vitamins?: Vitamins;
};

type IngredientCountable = {
  type?: "COUNTABLE";
  name: string;
  quantity?: number | null;
  nutritionPerUnit?: Nutrition | null;
};

type IngredientUncountable = {
  type?: "UNCOUNTABLE";
  name: string;
  mass_g?: number | null;
  nutritionPer100g?: Nutrition | null;
};

type Ingredient = IngredientCountable | IngredientUncountable;

type Meal = {
  mealNumber: number;
  name: string;
  ingredients: Ingredient[];
  nutrition?: Nutrition;
};

type DietDay = {
  dayNumber: number;
  meals: Meal[];
  nutrition?: Nutrition;
};

type DietPlan = {
  aim: string;
  preparationStyle: string;
  days: DietDay[];
  nutrition?: Nutrition;
};

function Generate() {
  const [gender, setGender] = useState("MALE")
  const [age, setAge] = useState("")
  const [bodyMass, setBodyMass] = useState("")
  const [leanBodyMass, setLeanBodyMass] = useState("")
  const [allergies, setAllergies] = useState("")
  const [aim, setAim] = useState("WEIGHT_GAIN") // WEIGHT_LOSS | WEIGHT_MAINTAIN | WEIGHT_GAIN
  const [lifestyle, setLifestyle] = useState("MODERATELY_ACTIVE") // NOT_ACTIVE | MODERATELY_ACTIVE | ACTIVE
  const [preparationStyle, setPreparationStyle] = useState("QUICK")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<DietPlan | null>(null)
  const [openrouterKey, setOpenrouterKey] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setPlan(null)
    const payload = {
      gender,
      age: age === "" ? null : Number(age),
      bodyMass: bodyMass === "" ? null : Number(bodyMass),
      leanBodyMass: leanBodyMass === "" ? null : Number(leanBodyMass),
      allergies,
      aim,
      lifestyle,
      preparationStyle
    }
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_BASE ?? "http://localhost:8008"
      const res = await fetch(`${base}/api/v1/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer demo",
          "X-OpenRouter-API-Key": openrouterKey || ""
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const text = await res.text();
        let msg = `Request failed: ${res.status}`;
        try {
          const err = JSON.parse(text);
          if (err?.message) msg = err.message;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json()
      setPlan(data)
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExcel = async () => {
    if (!plan) return;
    const XLSX = await import("xlsx");

    const rows: Array<Record<string, any>> = [];
    for (const day of plan.days) {
      for (const meal of day.meals) {
        for (const ing of meal.ingredients) {
          const isCountable = "quantity" in ing;
          const amount = isCountable
            ? `${ing.quantity ?? ""} pcs`
            : `${(ing as any).mass_g ?? ""} g`;

          const nut =
            (isCountable ? (ing as any).nutritionPerUnit : (ing as any).nutritionPer100g) ?? {};

          rows.push({
            Day: day.dayNumber,
            Meal: meal.mealNumber,
            "Meal name": meal.name,
            Ingredient: ing.name,
            Amount: amount,
            Calories: nut.calories ?? "",
            Proteins_g: nut.proteins_g ?? "",
            Fats_g: nut.fats_g ?? "",
            Carbs_g: nut.carbohydrates_g ?? "",
          });
        }
      }
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plan");
    XLSX.writeFile(workbook, "DietPlan.xlsx");
  }

  const handleDownloadPDF = async () => {
    if (!plan) return;
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 40;

    const addLine = (text: string, indent = 0) => {
      const maxWidth = pageWidth - 40 - indent;
      const lines = doc.splitTextToSize(text, maxWidth);
      for (const line of lines) {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 40;
        }
        doc.text(line, 20 + indent, y);
        y += 16;
      }
    }

    doc.setFontSize(16);
    addLine(`Diet plan (${plan.aim}, ${plan.preparationStyle})`);
    doc.setFontSize(11);
    y += 8;

    for (const day of plan.days) {
      addLine(`Day ${day.dayNumber}`, 0);
      for (const meal of day.meals) {
        addLine(`• Meal ${meal.mealNumber}: ${meal.name}`, 12);
        for (const ing of meal.ingredients) {
          const isCountable = "quantity" in ing;
          const amount = isCountable
            ? `${ing.quantity ?? ""} pcs`
            : `${(ing as any).mass_g ?? ""} g`;
          addLine(`- ${ing.name} — ${amount}`, 24);
        }
        y += 4;
      }
      y += 8;
    }

    doc.save("DietPlan.pdf");
  }

  const handleDownloadJSON = async () => {
    if (!plan) return;
    const json = JSON.stringify(plan, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `DietPlan_${plan.aim ?? "Plan"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="w-full py-15 md:py-20 px-4 sm:px-6 xl:px-40">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F2A37]">Parameters for plan generation</h1>
        <p className="mt-3 text-[#4B5563]">Fill in the fields below and proceed to generate.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="gender" className="mb-2 text-sm font-medium text-[#1F2A37]">Gender</label>
            <select id="gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]">
              <option value="MALE">male</option>
              <option value="FEMALE">female</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="age" className="mb-2 text-sm font-medium text-[#1F2A37]">Age</label>
            <input id="age" name="age" type="number" min="0" step="1" placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="bodyMass" className="mb-2 text-sm font-medium text-[#1F2A37]">Body mass (kg)</label>
            <input id="bodyMass" name="bodyMass" type="number" step="0.1" min="0" placeholder="70" value={bodyMass} onChange={(e) => setBodyMass(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="leanBodyMass" className="mb-2 text-sm font-medium text-[#1F2A37]">Lean body mass (kg)</label>
            <input id="leanBodyMass" name="leanBodyMass" type="number" step="0.1" min="0" placeholder="58" value={leanBodyMass} onChange={(e) => setLeanBodyMass(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="allergies" className="mb-2 text-sm font-medium text-[#1F2A37]">Allergies</label>
            <input id="allergies" name="allergies" type="text" placeholder="e.g. peanuts, gluten" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="aim" className="mb-2 text-sm font-medium text-[#1F2A37]">Aim</label>
            <select id="aim" name="aim" value={aim} onChange={(e) => setAim(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]">
              <option value="WEIGHT_LOSS">weight loss</option>
              <option value="WEIGHT_MAINTAIN">weight maintain</option>
              <option value="WEIGHT_GAIN">weight gain</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="lifestyle" className="mb-2 text-sm font-medium text-[#1F2A37]">Lifestyle</label>
            <select id="lifestyle" name="lifestyle" value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]">
              <option value="NOT_ACTIVE">not active</option>
              <option value="MODERATELY_ACTIVE">moderately active</option>
              <option value="ACTIVE">active</option>
            </select>
          </div>

        <div className="flex flex-col">
          <label htmlFor="preparationStyle" className="mb-2 text-sm font-medium text-[#1F2A37]">Preparation style</label>
          <select id="preparationStyle" name="preparationStyle" value={preparationStyle} onChange={(e) => setPreparationStyle(e.target.value)} className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]">
            <option value="QUICK">quick (≤ 25 min)</option>
            <option value="ELABORATE">elaborate (30-90 min)</option>
          </select>
        </div>

        {/* Full-width API key field (not stored) */}
        <div className="lg:col-span-2 flex flex-col">
          <label htmlFor="openrouterKey" className="mb-2 text-sm font-medium text-[#1F2A37]">
            Your OpenRouter API Key (will not be stored)
          </label>
          <input
            id="openrouterKey"
            name="openrouterKey"
            type="password"
            placeholder="sk-or-v1-..."
            value={openrouterKey}
            onChange={(e) => setOpenrouterKey(e.target.value)}
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#1F2A37] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]"
          />
        </div>

          <div className="mt-2 lg:col-span-2 flex flex-col items-center gap-3">
            <button disabled={loading} type="submit" className="w-full lg:w-1/2 inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#3A6EA5] text-white font-semibold shadow-sm hover:bg-[#5188c3] transition disabled:opacity-60">
              {loading ? "Generating..." : "Generate"}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {loading && (
              <p className="text-gray-600">Please stay on this page and wait for the generation to finish</p>
            )}
          </div>
          {plan && (
            <div className="mt-2 lg:col-span-2 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full lg:w-1/2 inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#111827] text-white font-semibold shadow-sm hover:bg-black/80 transition"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="w-full lg:w-1/2 inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#065f46] text-white font-semibold shadow-sm hover:bg-[#0b815f] transition"
              >
                Download Excel
              </button>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="w-full lg:w-1/2 inline-flex justify-center items-center px-6 py-3 rounded-md bg-[#816d0b] text-white font-semibold shadow-sm hover:bg-[#c1af13] transition"
              >
                Download JSON
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

export default Generate
