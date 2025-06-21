import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
    onSave: (file: File) => void
}

const SignaturePad: React.FC<Props> = ({ onSave}) => {
    const sigRef = useRef<SignatureCanvas | null> (null)

    const handleSave = async () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
            alert("Por favor, se tiene que firmar el dcoumento")
            return
        }
        const dataUrl = sigRef.current.getCanvas().toDataURL("image/png")
        const blob = await fetch(dataUrl).then(res  => res.blob())
        const file = new File([blob], `firma.png`, { type: "image/png"})
        onSave(file)
    }

    const handleClear = () => sigRef.current?.clear()
    
    return (
        <div className="mt-8 bg-white p-4 rounded-lg shadow-lg ">
            <p className="text-lg font-semibold mb-2">Firma del Operador</p>
            <SignatureCanvas
                penColor="black"
                ref={(ref) => {(sigRef.current = ref)}}
                canvasProps={{ width: 350, height: 200, className: "border rounded bg-white" }}
            />
            <div className="flex gap-4 mt-2">
                <button onClick={handleClear} className="bg-gray-300 px-4 py-1 rounded">Limpiar</button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1 rounded">Guardar Firma</button>
            </div>
        </div>
    )
}

export default SignaturePad