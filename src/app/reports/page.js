import SpendingBars3DSection from "@/components/spending/spending-bars-section";

export default function ReportsPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Reports</h1>
      <p>Spending reports and charts will go here.</p>

      {/* Spacer so the 3D section starts below the fold — makes the
          scroll-triggered grow-in animation actually visible/demoable
          instead of firing instantly on page load. */}
      <div style={{ height: "60vh" }} />

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Spending by Category</h2>
        <SpendingBars3DSection />
      </section>
    </main>
  );
}
      