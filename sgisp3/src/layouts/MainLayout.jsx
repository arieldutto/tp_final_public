// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header.jsx"; // ajustá la ruta si tu Header está en otro lugar
import Footer from "../components/layout/Footer.jsx";
import './MainLayout.css'
export default function MainLayout() {
    return (
        <>
            <Header />

            <main className="container-fluid main-background">
                <div className="glass-container">
                    <Outlet /> {/* Aquí se renderiza Home, AcercaDe, etc */}
                </div>
            </main>

            <Footer />
        </>
    );
}