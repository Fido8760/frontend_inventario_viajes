import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES_VIGILANCIA } from "../types/roles";

export default function VigilanciaRoute() {
    const { data: user } = useAuth();
    if(!user) return null;
    if(!ROLES_VIGILANCIA.includes(user.rol)) {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}