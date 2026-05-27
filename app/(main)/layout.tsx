import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/appSettings";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured()) {
    redirect("/setup");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#0d1117",
        }}
      >
        {children}
      </main>
    </div>
  );
}
