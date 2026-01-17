import { useState } from "react";
import { VillagePage } from "./components/VillagePage.tsx";
import { ChatPage } from "./components/ChatPage.tsx";
import { ProDashboard } from "./components/ProDashboard.tsx";
import { Button } from "./components/ui/button.tsx";
import { Home, MessageCircle, BarChart3 } from "lucide-react";

type Page = "village" | "chat" | "dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("village");

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-300 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🪔</div>
              <div>
                <h1 className="text-xl font-bold text-forest-800">
                  Panjaayathu
                </h1>
                <p className="text-xs text-stone-500">AI-First Student Wellness</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={currentPage === "village" ? "default" : "ghost"}
                onClick={() => setCurrentPage("village")}
                className={currentPage === "village" ? "bg-forest-700 hover:bg-forest-800" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"}
              >
                <Home className="w-4 h-4 mr-2" />
                Village
              </Button>
              <Button
                variant={currentPage === "chat" ? "default" : "ghost"}
                onClick={() => setCurrentPage("chat")}
                className={currentPage === "chat" ? "bg-forest-700 hover:bg-forest-800" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Coach
              </Button>
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                onClick={() => setCurrentPage("dashboard")}
                className={currentPage === "dashboard" ? "bg-forest-700 hover:bg-forest-800" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === "village" && <VillagePage />}
      {currentPage === "chat" && <ChatPage />}
      {currentPage === "dashboard" && <ProDashboard />}
    </div>
  );
}