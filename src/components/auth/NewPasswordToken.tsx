import { PinInput, PinInputField } from '@chakra-ui/pin-input'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ConfirmToken } from '../../types'
import { validateToken } from '../../api/AuthAPI'
import { toast } from 'react-toastify'

type Props = {
    token: ConfirmToken['token']
    setToken: React.Dispatch<React.SetStateAction<string>>
    setIsValidToken: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NewPasswordToken({ token, setToken, setIsValidToken }: Props) {
    const { mutate } = useMutation({
        mutationFn: validateToken,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => { toast.success(data); setIsValidToken(true) }
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">Verificar código</p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                    Ingresa el código de 6 dígitos que enviamos a tu correo.
                </p>
            </div>

            <div className="flex justify-center gap-2 py-4">
                <PinInput value={token} onChange={setToken} onComplete={(t) => mutate({ token: t })}>
                    {[...Array(6)].map((_, i) => (
                        <PinInputField
                            key={i}
                            className="h-12 w-12 text-center text-lg font-bold rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-slate-800"
                        />
                    ))}
                </PinInput>
            </div>

            <Link to="/auth/forgot-password" className="text-xs text-blue-500 text-center hover:underline py-2">
                Solicitar un nuevo código
            </Link>
        </div>
    )
}