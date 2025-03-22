import { Outlet } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
 
export default function AuthLayout() {
    return (
        <>
            <div className=" bg-slate-200 min-h-screen">
                <div className=" max-w-lg mx-auto pt-10 px-5">
                    <img src="/AMADO_LOGO.png" alt="Logotipo Amado" />

                    <div className=" py-10">
                        <Outlet />
                    </div>

                </div>
            </div>

            <ToastContainer />
        </>
    )
}
