import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
    onSave: (file: File) => Promise<void> | void;
    width?: number;
    height?: number;
};

const SignaturePad: React.FC<Props> = ({ onSave, width = 350, height = 200 }) => {
    const sigRef = useRef<SignatureCanvas | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
        alert("Por favor, firme el documento");
        return;
        }

        setIsSaving(true);
        try {
        const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
        const blob = await fetch(dataUrl).then(res => res.blob());
        const file = new File([blob], `firma-${Date.now()}.png`, { type: "image/png" });
        await onSave(file);
        } catch (error) {
        console.error("Error al guardar firma:", error);
        alert("Error al guardar la firma");
        } finally {
        setIsSaving(false);
        }
    };

    const handleClear = () => sigRef.current?.clear();

    return (
        <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg font-semibold mb-2">Firma del Operador</p>
        <SignatureCanvas
            penColor="black"
            ref={(ref) => { sigRef.current = ref }}
            canvasProps={{
            width,
            height,
            className: "border rounded bg-white",
            'aria-label': "Área para firmar",
            role: "img"
            }}
        />
        <div className="flex gap-4 mt-2">
            <button 
            onClick={handleClear} 
            className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400 transition"
            >
            Limpiar
            </button>
            <button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            >
            {isSaving ? 'Guardando...' : 'Guardar Firma'}
            </button>
        </div>
        </div>
    );
};

export default SignaturePad;