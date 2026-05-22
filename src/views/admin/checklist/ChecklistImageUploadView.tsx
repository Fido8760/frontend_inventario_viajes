import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { uploadImage, finalizarFotos } from "../../../api/ChecklistAPI";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import SignaturePad from "../../../components/admin/SignaturePad";

const requiredFields = [
    { id: "frontal", label: "Foto Frontal" },
    { id: "lateral_derecho", label: "Lateral Derecha" },
    { id: "lateral_izquierdo", label: "Lateral Izquierda" },
    { id: "trasera", label: "Foto Trasera" },
    { id: "interior_cabina", label: "Interior Cabina" },
    { id: "documentacion", label: "Documentación" },
    { id: "odometro", label: "Odómetro (Foto)" },
];

const optionalFields = Array.from({ length: 16 }, (_, i) => ({
    id: `opcional_${i + 1}`, label: `Opcional ${i + 1}`
}));

export default function ChecklistImageUploadView() {
    const { asignacionId, checklistId } = useParams();
    const navigate = useNavigate();

    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>({});
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

    // 1. Obtener datos completos (vienen del caché de la vista anterior)
    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    // 2. Sincronizar imágenes existentes desde la DB al estado inicial
    useEffect(() => {
        if (data?.checklist?.imagenes) {
            console.log("Imágenes desde BD:", data.checklist.imagenes);
            const urls: Record<string, string> = {};
            const uploaded: Record<string, boolean> = {};
            data.checklist.imagenes.forEach((img) => { 
                urls[img.fieldId] = img.urlImagen;
                uploaded[img.fieldId] = true;
            });
            setImageUrls(urls);
            setUploadedFields(uploaded);
        }
    }, [data]);

    const uploadMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: (data, vars) => {
            setUploadedFields(prev => ({ ...prev, [vars.fieldId]: true }));
            toast.success(data.message || `Imagen ${vars.fieldId} subida`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Error al subir la imagen");
        }
    });

    const finalizeMutation = useMutation({
        mutationFn: finalizarFotos,
        onSuccess: () => {
            toast.success("Asignación Finalizada Correctamente");
            navigate("/?page=1");
        },
        onError: (error: any) => toast.error(error.message)
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFields(prev => ({ ...prev, [fieldId]: true }));
        uploadMutation.mutate({ file, asignacionId: +asignacionId!, checklistId: +checklistId!, fieldId }, {
            onSettled: () => setUploadingFields(prev => ({ ...prev, [fieldId]: false }))
        });

        const reader = new FileReader();
        reader.onloadend = () => setImageUrls(prev => ({ ...prev, [fieldId]: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const handleSaveSignature = (file: File) => {
        uploadMutation.mutate({ file, asignacionId: +asignacionId!, checklistId: +checklistId!, fieldId: "firma" });
        setUploadedFields(prev => ({ ...prev, firma: true }));
        const reader = new FileReader();
        reader.onloadend = () => setImageUrls(prev => ({ ...prev, firma: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const canFinalize = requiredFields.every(f => uploadedFields[f.id]) && uploadedFields["firma"];

    if (isLoading) return <p className="text-center py-20 text-gray-500">Cargando datos...</p>;

    return (
        <div className="max-w-6xl mx-auto pb-24 px-4">
            <h1 className="text-3xl font-black text-[#0f1f3d]">Paso 3: Fotografías y Firma</h1>
            <p className="text-gray-500 mt-2">Gestiona las imágenes obligatorias y opcionales del checklist.</p>

            {/* Grid Obligatorias */}
            <h2 className="text- font-bold mt-10 text-gray-700 uppercase tracking-wider">Fotografías Obligatorias</h2>
            <p className="text-xs text-gray-500 mb-2">Presiona para agregar una imagen o tomar una foto</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {requiredFields.map(f => (
                    <div key={f.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 truncate">{f.label}</p>
                        <div className="relative h-32 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden rounded-lg group">
                            <input 
                                type="file"
                                accept=".jpeg,.jpg,.png"
                                capture="environment" 
                                onChange={e => handleChange(e, f.id)} 
                                className="absolute inset-0 opacity-0 z-20 cursor-pointer" 
                            />
                            {imageUrls[f.id] ? (
                                <>
                                    <img src={imageUrls[f.id]!} className="object-cover w-full h-full" alt={f.label} />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-[10px] font-bold">CAMBIAR</span>
                                    </div>
                                    {/* ← agrega el overlay aquí, dentro del bloque imageUrls */}
                                    {!uploadingFields[f.id] && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 py-1 flex items-center justify-center gap-1 z-10">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-white text-[9px] font-bold uppercase">Subida</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="text-3xl text-gray-200">+</span>
                            )}
                            {uploadingFields[f.id] && <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold text-blue-600">SUBIENDO...</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid Opcionales */}
            <h2 className="text-lg font-bold mt-12 text-gray-700 uppercase tracking-wider text-opacity-50">Fotografías Opcionales</h2>
            <p className="text-xs text-gray-500 mb-2">Presiona para agregar una imagen o tomar una foto</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {optionalFields.map(f => (
                    <div key={f.id} className="relative h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        <input type="file" capture="environment" onChange={e => handleChange(e, f.id)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                       {imageUrls[f.id] ? (
                            <>
                                <img src={imageUrls[f.id]!} className="object-cover w-full h-full" alt={f.label} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-bold">CAMBIAR</span>
                                </div>
                                {/* ← agrega el overlay aquí, dentro del bloque imageUrls */}
                                {!uploadingFields[f.id] && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 py-1 flex items-center justify-center gap-1 z-10">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-white text-[9px] font-bold uppercase">Subida</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-3xl text-gray-200">+</span>
                        )}
                        {uploadingFields[f.id] && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[8px]">...</div>}
                    </div>
                ))}
            </div>

            {/* Sección Firma */}
           <div className="mt-16 border-t border-gray-100 pt-10">
                <div className="max-w-lg mx-auto">
                    <h2 className="text-base font-semibold text-gray-900 text-center mb-1">
                        Firma del Operador
                    </h2>
                    <p className="text-xs text-gray-400 text-center mb-6">
                        El operador debe firmar para confirmar el checklist
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <SignaturePad onSave={handleSaveSignature} />
                        {imageUrls["firma"] && (
                            <div className="mt-5 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">
                                    ✓ Firma capturada
                                </p>
                                <img
                                    src={imageUrls["firma"]}
                                    className="h-20 mx-auto object-contain"
                                    alt="Firma"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Botón Acción Final */}
            {canFinalize && (
                <div className="mt-16 flex justify-center pb-10">
                    <button
                        onClick={() => finalizeMutation.mutate({ asignacionId: +asignacionId!, checklistId: +checklistId! })}
                        disabled={finalizeMutation.isPending}
                        className="w-full md:w-96 bg-[#10B981] hover:bg-[#059669] text-white font-black py-5 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {finalizeMutation.isPending ? 'Procesando...' : 'Finalizar y Cerrar Asignación'}
                    </button>
                </div>
            )}
        </div>
    );
}