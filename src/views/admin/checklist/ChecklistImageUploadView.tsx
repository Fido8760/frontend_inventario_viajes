import { useMutation } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom"; // <-- Importa useNavigate
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import imageCompression from 'browser-image-compression'
import { uploadImage } from "../../../api/ChecklistAPI";


const imageFields = [
    { id: "frontal", label: "Fotografía Frontal de la Unidad" },
    { id: "lateral_derecho", label: "Fotografía Lateral Derecha de la Unidad" },
    { id: "lateral_izquierdo", label: "Fotografía Lateral Izquierda de la Unidad" },
    { id: "documentacion", label: "Fotografía de la Documentación" },
    { id: "interior", label: "Fotografía del Interior de la Cabina de la Unidad" },
    { id: "remolque_lateral_derecho", label: "Fotografía del Lateral Derecho del Remolque" },
    { id: "remolque_lateral_izquierdo", label: "Fotografía del Lateral Izquierdo del Remolque" },
    { id: "remolque_puertas", label: "Fotografía de las Puertas del Remolque" },
];

export default function ChecklistImageUploadView() {
    const params = useParams();
    const asignacionId = +params.asignacionId!;
    const checklistId = +params.checklistId!;
    const navigate = useNavigate(); // <-- Hook para redirección

    // Estado para almacenar la URL de la imagen por cada campo
    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    // Estado para rastrear qué campos han sido subidos
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Verificar si el checklist está completo antes de redirigir
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
            // Actualiza el estado de campos subidos
            setUploadedFields(prev => ({ ...prev, [variables.fieldId]: true }));
        },
    });

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        const files = e.target.files;
        if (files && files.length > 0 && asignacionId && checklistId) {
            const orginalFile = files[0]

            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/webp'
                }

                const compressedFile = await imageCompression(orginalFile, options)

                const renamedFile = new File([compressedFile], `${fieldId}.webp`, {
                type: 'image/webp',
            });
                const data = { file: renamedFile, asignacionId, checklistId, fieldId };
                uploadImageMutation.mutate(data);
    
                // Actualiza la vista previa inmediatamente
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

    const isChecklistComplete = Object.keys(uploadedFields).length === imageFields.length;

    const handleFinalizeChecklist = () => {
        localStorage.setItem("checklistCompleted", "true"); // Guardar en localStorage
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-black">Paso 3: Subir Imágenes</h1>
            <p className="text-xl font-light text-gray-500 mt-5">
                En esta sección deberás tomar las fotografías solicitadas
            </p>

            <form className="mt-10 bg-white shadow-lg p-10 rounded-lg" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFields.map(({ id, label }) => (
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
                                    disabled={uploadedFields[id] || uploadImageMutation.status === 'pending'}
                                />
                                <div className={`border border-gray-300 rounded-md px-4 py-2 bg-slate-100 hover:bg-slate-200 flex items-center justify-center h-12 ${uploadedFields[id] || uploadImageMutation.status === 'pending' ? 'bg-gray-200 cursor-not-allowed' : ''}`}>
                                    <span className="text-sm text-gray-700">
                                        {uploadedFields[id] ? 'Imagen Subida' : 'Seleccionar Archivo'}
                                    </span>
                                </div>
                            </div>
                            {imageUrls[id] && (
                                <div className="mt-2">
                                    <img src={imageUrls[id]} alt={`Vista previa de ${label}`} className="max-h-24 object-contain rounded-md w-full border border-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isChecklistComplete && (
                    <div className="mt-6 flex justify-center">
                        <Link 
                            to="/?page=1" 
                            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-md"
                            onClick={handleFinalizeChecklist}
                        >
                            Finalizar Checklist
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}
