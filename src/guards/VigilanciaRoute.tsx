import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Rol } from "../types/roles";

export default function VigilanciaRoute() {
    const { data: user } = useAuth();
    if(!user) return null;
    if(user.rol !== Rol.VIGILANTE && user.rol !== Rol.SISTEMAS) {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}