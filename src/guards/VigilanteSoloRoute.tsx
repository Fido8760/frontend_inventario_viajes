import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Rol } from "../types/roles";

export default function VigilanteSoloRoute() {
    const { data: user } = useAuth();
    if(!user) return null
    if(user.rol === Rol.VIGILANTE) return <Navigate to="/vigilancia" replace />
    return <Outlet />
}