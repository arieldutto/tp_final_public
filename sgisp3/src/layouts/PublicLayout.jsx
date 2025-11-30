// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./PublicLayout.css";

export default function PublicLayout() {
    return (
        <div className="public-layout-wrapper">
            <div className="public-layout-content">
                <Outlet />
            </div>
        </div>
    );
}