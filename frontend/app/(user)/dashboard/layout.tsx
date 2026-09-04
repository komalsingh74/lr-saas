import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex !h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-4 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}