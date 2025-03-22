import { Link } from "react-router-dom";

export default function ForgotPassword() {
    return (
        <>
            <h1 className=" text-4xl font-bold">Olvidé mi Password</h1>
            <nav className=" mt-10">
                <Link
                    className=" text-center text-lg block"
                    to={'/auth/login'}
                >
                    ¿Ya tienes una cuenta? Inicia sesión aquí
                </Link>
            </nav>
        </>
    )
}
