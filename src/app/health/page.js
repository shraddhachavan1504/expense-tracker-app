async function getHealthData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  if (!res.ok) {
    throw new Error("Failed to fetch health data");
  }
  return res.json();
}

export default async function HealthPage() {
  const data = await getHealthData();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Health Check</h1>
      <p>Status: OK</p>
      <pre
        style={{
          background: "#f4f4f4",
          color: "#111111",
          padding: "1rem",
          borderRadius: "4px",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}