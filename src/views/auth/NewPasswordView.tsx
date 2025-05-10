import { useState } from "react"
import NewPasswordToken from "../../components/auth/NewPasswordToken"
import NewPasswordForm from "../../components/auth/NewPasswordForm"

export default function NewPasswordView() {
    const [token, setToken] = useState('')
    const [isValidToken, setIsValidToken] = useState(false)
    return (
        <>
            <h1 className=" text-3xl font-bold">Reestablecer Password</h1>
            <p className=" text-xl font-light text-gray-500 mt-5">
                Ingresa el código de verificación que te enviamos a tu correo electrónico
            </p>

            { !isValidToken ? 
                <NewPasswordToken token={token} setToken={setToken} setIsValidToken={setIsValidToken} /> : 
                <NewPasswordForm token={token} />
            }
        </>
    )
}
