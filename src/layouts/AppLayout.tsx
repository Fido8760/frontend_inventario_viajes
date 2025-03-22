import { Link, Outlet } from "react-router-dom";
import Logo from "../components/admin/Logo";
import NavMenu from "../components/admin/NavMenu";
import { ToastContainer } from "react-toastify";

export default function AppLayout() {
    return (
        <>
        
            <header
                className=" bg-stone-300 py-5 shadow"
            >
                <div className=" max-w-screen-2xl mx-auto flex flex-col lg:flex-row justify-between items-center">
                    <div className=" w-64">
                        <Link to={'/'}>
                            <Logo />
                        
                        </Link>
                    </div>
                    <NavMenu />
                </div>

            </header>
            <section className="max-w-screen-2xl mx-auto mt-10 p-5">
                <Outlet />

            </section>

            <footer className=" py-5">
                <p className=" text-center">
                    Todos los Derechos Reservados {new Date().getFullYear()}
                </p>
            </footer>

            <ToastContainer />

        
        </>
    )
}
