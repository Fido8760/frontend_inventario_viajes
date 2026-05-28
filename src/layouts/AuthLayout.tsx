import { Outlet } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AuthLayout() {
    return (
        <>
            <div className="min-h-screen grid lg:grid-cols-2">
                <div className="hidden lg:flex relative bg-[#0f1f3d] overflow-hidden">
                    <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full -top-20 -left-20 blur-3xl"></div>
                    <div className="absolute w-96 h-96 bg-cyan-400/10 rounded-full bottom-0 right-0 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                        <div>
                            <p className=" text-4xl font-bold text-white">Check<span className="text-blue-400">Fleet</span></p>
                            <p className=" text-blue-100/70 mt-4 max-w-md leading-relaxed">Plataforma para gestión, monitoreo y control operativo de unidades y checklists.</p>
                        </div>
                        <div className=" space-y-4">
                            <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-5">
                                <p className=" text-white font-medium">Control operativo</p>
                                <p className="text-white/50 text-sm mt-1">Administración y seguimiento de unidades en tiempo real.</p>
                            </div>
                            <p className=" text-white/20 text-xs">© 2026 · Solo para personal autorizado</p>
                        </div>
                    </div>
                </div>
                <div className=" bg-[#0f1f3d] lg:bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10 min-h-screen lg:min-h-0">
                    <div className="lg:hidden text-center mb-6 w-full max-w-md px-4">
                        <p className="text-3xl sm:text-4xl font-bold text-white">Check<span className="text-blue-400">Fleet</span></p>
                        <p className="text-blue-100/70 mt-2 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">Plataforma para gestión, monitoreo y control operativo de unidades y checklists.</p>
                    </div>
                    <div className=" w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 md:p-10 flex flex-col gap-4 sm:gap-5">
                        <div className="mb-2 sm:mb-4 flex justify-center">
                            <img src="/AMADO_LOGO.png" alt="Logo" className="h-12 sm:h-14 object-contain" />
                        </div>
                        <Outlet />
                    </div>
                    <div className="lg:hidden mt-6 w-full max-w-md text-center space-y-4 px-4">
                        <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
                            <p className=" text-white font-medium text-sm">Control operativo</p>
                            <p className=" text-white/55 text-xs mt-1 leading-relaxed">Administración y seguimiento de unidades en tiempo real.</p>
                        </div>
                        <p className=" text-white/30 text-xs">© 2026 · Solo para personal autorizado</p>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    )
}