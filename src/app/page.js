import { SpendingChat } from "@/components/chat/spending-chat";
import { mockExpenses } from "./expenses/mock-data";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Expense summary will go here.</p>
      <div style={{ marginTop: "2rem", height: "500px" }}>
        <SpendingChat expenses={mockExpenses}/>
      </div>
    </main>
  );
}