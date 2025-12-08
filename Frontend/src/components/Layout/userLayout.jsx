import React from "react";
import { NavbarDemo } from "../common/navBar";
import { Footer } from "../common/footer";
import { Outlet, useLocation } from "react-router-dom";

export const UserLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="relative w-full min-h-screen">
      {isHomePage && <NavbarDemo />}

      {/* MAIN CONTENT */}
      <main className="relative w-full">
        <Outlet />
      </main>

      {!isHomePage && <Footer />}
    </div>
  );
};
