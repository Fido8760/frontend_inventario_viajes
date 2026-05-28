import { useState } from "react"
import NewPasswordToken from "../../components/auth/NewPasswordToken"
import NewPasswordForm from "../../components/auth/NewPasswordForm"

export default function NewPasswordView() {
    const [token, setToken] = useState('')
    const [isValidToken, setIsValidToken] = useState(false)

    return !isValidToken
        ? <NewPasswordToken token={token} setToken={setToken} setIsValidToken={setIsValidToken} />
        : <NewPasswordForm token={token} />
}