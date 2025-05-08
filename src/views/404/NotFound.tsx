import { Link } from "react-router-dom";

export default function NotFound() {
    return (

        <>
            <h1 className=" font-black text-center text-4xl">Página no encontrada</h1>
            <p className=" mt-10 text-center text-slate-800">
                Volver al
                <Link
                    className=" text-blue-900 font-bold"
                    to={"/?page=1"}
                > Dashboard</Link>
            </p>
        </>
    )
}
