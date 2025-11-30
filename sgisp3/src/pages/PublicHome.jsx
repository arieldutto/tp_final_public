// src/pages/PublicHome.jsx
import React from "react";
import "../styles/publicHome.css";
// Si tu login está en features/auth/pages:
import Login from "../features/auth/pages/Login";

export default function PublicHome() {
    return (
        <div className="public-home-container">
            <div className="public-home-glass-card">
                <div className="public-home-header">
                    <h1>Bienvenido al Sistema</h1>
                    <p className="subtitle">Accedé para continuar</p>
                </div>

                <Login />
                {/* Esto renderiza tu formulario dentro de la card */}
            </div>
        </div>
    );
}