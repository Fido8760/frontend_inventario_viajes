import { Navigate, Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { useAuth } from "../hooks/useAuth"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

export default function AppLayout() {
    const { data, isError, isLoading } = useAuth()

    if (isLoading) return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    )

    if (isError) return <Navigate to="/auth/login" />

    if (data) return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header user={data} />
            <main className="flex-1 max-w-screen-xl w-full mx-auto p-6">
                <Outlet />
            </main>
            <Footer />
            <ToastContainer />
        </div>
    )
}