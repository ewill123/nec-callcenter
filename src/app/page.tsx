// src/app/page.tsx
import IncidentForm from "../components/IncidentForm"; // adjust the path if needed

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <IncidentForm />
    </main>
  );
}
