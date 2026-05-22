import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
    onSave: (file: File) => Promise<void> | void;
    height?: number;
};

const SignaturePad: React.FC<Props> = ({ onSave, height = 180 }) => {
    const sigRef      = useRef<SignatureCanvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving]   = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(350);

    // Calcula el ancho real del contenedor y lo asigna al canvas
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setCanvasWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handleSave = async () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
            alert("Por favor, firme el documento");
            return;
        }
        setIsSaving(true);
        try {
            const dataUrl = sigRef.current.getCanvas().toDataURL("image/png");
            const blob    = await fetch(dataUrl).then(res => res.blob());
            const file    = new File([blob], `firma-${Date.now()}.png`, { type: "image/png" });
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
        <div ref={containerRef} className="w-full">
            {/* Canvas */}
            <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <SignatureCanvas
                    penColor="black"
                    ref={(ref) => { sigRef.current = ref }}
                    canvasProps={{
                        width:     canvasWidth,
                        height,
                        className: "block w-full bg-white",
                        'aria-label': "Área para firmar",
                        role: "img"
                    }}
                />
            </div>

            <p className="text-xs text-gray-400 text-center mt-2 mb-4">
                Firme dentro del recuadro
            </p>

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex-1 py-2 text-sm text-white rounded-lg transition-colors ${
                        isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#0f1f3d] hover:bg-[#1a3a6b]'
                    }`}
                >
                    {isSaving ? 'Guardando...' : 'Guardar firma'}
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;