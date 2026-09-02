"use client";

import { useState } from "react";

const CATEGORIES = ["Groceries", "Transport", "Dining", "Entertainment", "Utilities"];

export interface ExpenseFormValues {
  date: string;
  category: string;
  amount: number;
  description: string;
}

interface AddExpenseFormProps {
  onSubmit: (values: ExpenseFormValues) => void;
}

export function AddExpenseForm({ onSubmit }: AddExpenseFormProps) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};

    if (!date) next.date = "Date is required.";
    if (!category) next.category = "Category is required.";

    const parsedAmount = Number(amount);
    if (!amount) {
      next.amount = "Amount is required.";
    } else if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      next.amount = "Amount must be a positive number.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      date,
      category,
      amount: Number(amount),
      description: description.trim(),
    });

    setDate("");
    setCategory("");
    setAmount("");
    setDescription("");
    setErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="expense-date" className="text-sm text-neutral-300">
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm text-[#F7F6F2]"
        />
        {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="expense-category" className="text-sm text-neutral-300">
          Category
        </label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm text-[#F7F6F2]"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="expense-amount" className="text-sm text-neutral-300">
          Amount
        </label>
        <input
          id="expense-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm text-[#F7F6F2]"
        />
        {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="expense-description" className="text-sm text-neutral-300">
          Description
        </label>
        <input
          id="expense-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm text-[#F7F6F2]"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-[#1E3AF2] px-4 py-2 text-sm font-medium text-[#F7F6F2]"
      >
        Add Expense
      </button>
    </form>
  );
}