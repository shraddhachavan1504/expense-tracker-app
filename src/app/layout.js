import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Track your expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="flex flex-wrap gap-4 p-4 border-b border-gray-300">
          <a href="/" className="whitespace-nowrap">Dashboard</a>
          <a href="/expenses" className="whitespace-nowrap">Expenses</a>
          <a href="/expenses/new" className="whitespace-nowrap">Add Expense</a>
          <a href="/categories" className="whitespace-nowrap">Categories</a>
          <a href="/reports" className="whitespace-nowrap">Reports</a>
        </nav>
        {children}
      </body>
    </html>
  );
}