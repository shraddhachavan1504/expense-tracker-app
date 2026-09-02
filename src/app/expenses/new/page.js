"use client";

import { AddExpenseForm } from "@/components/expenses/add-expense-form";

export default function AddExpensePage() {
  function handleAddExpense(values) {
    // TODO: persist to your real expense store (localStorage, per your
    // architecture notes) — placeholder for now.
    console.log("New expense:", values);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Add Expense</h1>
      <div style={{ marginTop: "1.5rem" }}>
        <AddExpenseForm onSubmit={handleAddExpense} />
      </div>
    </main>
  );
}