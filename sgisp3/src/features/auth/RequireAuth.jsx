import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth() {
    const { user, loading } = useAuth()
    console.log("RequireAuth llamado. Usuario logueado:", user);
    if (loading) {
        return <div>
            Cargando...
        </div>
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />
}