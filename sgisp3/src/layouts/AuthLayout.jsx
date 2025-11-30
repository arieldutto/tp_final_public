// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import './AuthLayout.css'
export default function AuthLayout() {
    return (
        <div className="auth-layout">
            {/* Contenedor centrado típico para login */}
            <main className="container-fluid auth-background">
                <div className="auth-wrapper">
                    <Outlet /> {/* Aquí se renderiza Login (u otras páginas de auth) */}
                </div>
            </main>
        </div>
    );
}