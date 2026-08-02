import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Track your expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ display: "flex", gap: "1.5rem", padding: "1rem 2rem", borderBottom: "1px solid #ddd" }}>
          <a href="/">Dashboard</a>
          <a href="/expenses">Expenses</a>
          <a href="/expenses/new">Add Expense</a>
          <a href="/categories">Categories</a>
          <a href="/reports">Reports</a>
        </nav>
        {children}
      </body>
    </html>
  );
}