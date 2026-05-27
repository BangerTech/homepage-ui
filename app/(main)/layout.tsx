import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/appSettings";
import Sidebar from "@/components/Sidebar";
import ReachabilityProvider from "@/components/ReachabilityProvider";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured()) {
    redirect("/setup");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <ReachabilityProvider>
        <main style={{ flex: 1, overflowY: "auto", backgroundColor: "#070b11" }}>
          {children}
        </main>
      </ReachabilityProvider>
    </div>
  );
}
