import { Outlet } from "@tanstack/react-router";

import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#150e0b] text-[#f0e8df]">
      <Header />

      <div className="pb-24 md:pb-0">
        <Outlet />
      </div>

      <MobileNavigation />
    </div>
  );
}
