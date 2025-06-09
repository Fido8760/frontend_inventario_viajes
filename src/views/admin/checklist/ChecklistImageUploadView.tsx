import { useMutation } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import imageCompression from 'browser-image-compression';
import { uploadImage } from "../../../api/ChecklistAPI";

// Campos obligatorios
const requiredImageFields = [
    { id: "frontal", label: "Fotografía Frontal de la Unidad" },
    { id: "lateral_derecho", label: "Fotografía Lateral Derecha de la Unidad" },
    { id: "lateral_izquierdo", label: "Fotografía Lateral Izquierda de la Unidad" },
    { id: "documentacion", label: "Fotografía de la Documentación" },
    { id: "interior", label: "Fotografía del Interior de la Cabina de la Unidad" },
    { id: "remolque_lateral_derecho", label: "Fotografía del Lateral Derecho del Remolque" },
    { id: "remolque_lateral_izquierdo", label: "Fotografía del Lateral Izquierdo del Remolque" },
    { id: "remolque_puertas", label: "Fotografía de las Puertas del Remolque" },
];

// Campos opcionales
const optionalImageFields = [
    { id: "opcional_1", label: "Imagen Adicional 1 (Opcional)" },
    { id: "opcional_2", label: "Imagen Adicional 2 (Opcional)" },
    { id: "opcional_3", label: "Imagen Adicional 3 (Opcional)" },
    { id: "opcional_4", label: "Imagen Adicional 4 (Opcional)" },
    { id: "opcional_5", label: "Imagen Adicional 5 (Opcional)" },
    { id: "opcional_6", label: "Imagen Adicional 6 (Opcional)" },
    { id: "opcional_7", label: "Imagen Adicional 7 (Opcional)" },
    { id: "opcional_8", label: "Imagen Adicional 8 (Opcional)" },
];

export default function ChecklistImageUploadView() {
    const params = useParams();
    const asignacionId = +params.asignacionId!;
    const checklistId = +params.checklistId!;
    const navigate = useNavigate();

    // Recuperar estado guardado
    const savedState = localStorage.getItem(`uploadProgress_${checklistId}`);
    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>(
        savedState ? JSON.parse(savedState).imageUrls : {}
    );
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>(
        savedState ? JSON.parse(savedState).uploadedFields : {}
    );

    // Guardar estado en localStorage
    useEffect(() => {
        const stateToSave = JSON.stringify({ imageUrls, uploadedFields });
        localStorage.setItem(`uploadProgress_${checklistId}`, stateToSave);
    }, [imageUrls, uploadedFields, checklistId]);

    useEffect(() => {
        if (localStorage.getItem("checklistCompleted") === "true") {
            navigate(`/asignacion/${asignacionId}/createChecklist/${checklistId}/uploadImages`, { replace: true });
        }
    }, [navigate, asignacionId, checklistId]);

    const uploadImageMutation = useMutation({
        mutationFn: uploadImage,
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (data, variables) => {
            toast.success(data.message);
            setUploadedFields(prev => ({ ...prev, [variables.fieldId]: true }));
        },
    });

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        const files = e.target.files;
        if (files && files.length > 0 && asignacionId && checklistId) {
            const originalFile = files[0];

            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/webp'
                };

                const compressedFile = await imageCompression(originalFile, options);
                const renamedFile = new File([compressedFile], `${fieldId}.webp`, {
                    type: 'image/webp',
                });
                const data = { file: renamedFile, asignacionId, checklistId, fieldId };
                uploadImageMutation.mutate(data);

                // Vista previa inmediata
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageUrls(prev => ({ ...prev, [fieldId]: reader.result as string }));
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                toast.error("Error al comprimir la imagen.");
                console.error("Error al comprimir:", error);
            }
        }
    };

    // Solo requiere las 8 obligatorias para completar
    const isChecklistComplete = requiredImageFields.every(field => uploadedFields[field.id]);

    const handleFinalizeChecklist = () => {
        localStorage.setItem("checklistCompleted", "true");
        // Limpiar estado guardado
        localStorage.removeItem(`uploadProgress_${checklistId}`);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-black">Paso 3: Subir Imágenes</h1>
            <p className="text-xl font-light text-gray-500 mt-5">
                Sube las fotografías obligatorias y opcionales
            </p>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Imágenes Obligatorias</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white shadow-lg p-6 rounded-lg">
                    {requiredImageFields.map(({ id, label }) => (
                        <div key={id} className="space-y-2">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                                {label}
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id={id}
                                    name={id}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handleChange(e, id)}
                                    disabled={uploadedFields[id] || uploadImageMutation.isPending}
                                />
                                <div className={`border rounded-md px-4 py-2 flex items-center justify-center h-12 transition-colors ${
                                    getButtonStyle(id, uploadImageMutation.isPending, uploadedFields[id])
                                }`}>
                                    {uploadImageMutation.isPending ? (
                                        <span className="flex items-center">
                                            Subiendo...
                                        </span>
                                    ) : uploadedFields[id] ? (
                                        <span>Subido ✓</span>
                                    ) : (
                                        <span>Seleccionar</span>
                                    )}
                                </div>
                            </div>
                            {imageUrls[id] && (
                                <div className="mt-2">
                                    <img 
                                        src={imageUrls[id]} 
                                        alt={`Vista previa de ${label}`} 
                                        className="max-h-24 w-full object-contain rounded-md border border-gray-300" 
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Imágenes Opcionales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white shadow-lg p-6 rounded-lg">
                    {optionalImageFields.map(({ id, label }) => (
                        <div key={id} className="space-y-2">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                                {label}
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id={id}
                                    name={id}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handleChange(e, id)}
                                    disabled={uploadedFields[id] || uploadImageMutation.isPending}
                                />
                                <div className={`border rounded-md px-4 py-2 flex items-center justify-center h-12 transition-colors ${
                                    getButtonStyle(id, uploadImageMutation.isPending, uploadedFields[id])
                                }`}>
                                    {uploadImageMutation.isPending ? (
                                        <span className="flex items-center">
                                            Subiendo...
                                        </span>
                                    ) : uploadedFields[id] ? (
                                        <span>Subido ✓</span>
                                    ) : (
                                        <span>Seleccionar</span>
                                    )}
                                </div>
                            </div>
                            {imageUrls[id] && (
                                <div className="mt-2">
                                    <img 
                                        src={imageUrls[id]} 
                                        alt={`Vista previa de ${label}`} 
                                        className="max-h-24 w-full object-contain rounded-md border border-gray-300" 
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isChecklistComplete && (
                <div className="mt-8 flex justify-center">
                    <Link 
                        to="/?page=1" 
                        className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all"
                        onClick={handleFinalizeChecklist}
                    >
                        Finalizar Checklist
                    </Link>
                </div>
            )}
        </div>
    );
}

// Función auxiliar para estilos del botón
function getButtonStyle(fieldId: string, isUploading: boolean, isUploaded: boolean) {
    if (isUploading) {
        return "bg-yellow-100 border-yellow-500 text-yellow-700 cursor-not-allowed";
    }
    if (isUploaded) {
        return "bg-green-100 border-green-500 text-green-700";
    }
    return "bg-slate-100 border-gray-300 hover:bg-slate-200 cursor-pointer";
}