import React from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "./Header";
import LoadingSpinner from "../UI/LoadingSpinner";

function Layout() {
  const { isLoading } = useApp();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
