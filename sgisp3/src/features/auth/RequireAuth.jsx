import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
    const isLogged = localStorage.getItem("user"); // Ejemplo simple
    console.log("RequireAuth llamado. Usuario logueado:", isLogged);

    return isLogged ? <Outlet /> : <Navigate to="/" />;
}