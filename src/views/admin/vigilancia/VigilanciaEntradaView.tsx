import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import { getAsignacionById } from "../../../api/AsignacionAPI";
import { registrarEntrada, uploadEntradaImage } from "../../../api/VigilanciaAPI";
import { toast } from "react-toastify";
import { ArrowLeftIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const FOTOS_ENTRADA = [
    { id: 'entrada_frontal',    label: 'Frontal' },
    { id: 'entrada_trasera',    label: 'Trasera' },
    { id: 'entrada_izquierdo',  label: 'Lateral Izquierdo' },
    { id: 'entrada_derecho',    label: 'Lateral Derecho' },
]

export default function VigilanciaEntradaView() {
    const {asignacionId} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>({});
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
    const [observaciones, setObservaciones] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });
    
    useEffect(() => {
        if (data?.checklist?.imagenes) {
            const urls: Record<string, string>    = {}
            const uploaded: Record<string, boolean> = {}
            data.checklist.imagenes.forEach(img => {
                urls[img.fieldId]     = img.urlImagen
                uploaded[img.fieldId] = true
            })
            setImageUrls(urls)
            setUploadedFields(uploaded)
        }
    }, [data]);

    const uploadMutation = useMutation({ mutationFn: uploadEntradaImage });

    const finalizarMutation = useMutation({
        mutationFn: registrarEntrada,
        onSuccess: () => {
            toast.success('Entrada registrada correctamente')
            queryClient.invalidateQueries({ queryKey: ['asignaciones-en-ruta'] })
            queryClient.invalidateQueries({ queryKey: ['Asignacion', +asignacionId!] })
            navigate('/vigilancia')
        },
        onError: (error: Error) => toast.error(error.message)
    })
 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        if (uploadingFields[fieldId]) return
        const file = e.target.files?.[0]
        if (!file) return
 
        const checklistId = data?.checklist?.id
        if (!checklistId) {
            toast.error('No se encontró el checklist')
            return
        }
 
        setUploadingFields(prev => ({ ...prev, [fieldId]: true }))
 
        const reader = new FileReader()
 
        uploadMutation.mutate(
            { file, asignacionId: +asignacionId!, checklistId, fieldId },
            {
                onSuccess: () => {
                    reader.onloadend = () => {
                        setImageUrls(prev => ({ ...prev, [fieldId]: reader.result as string }))
                    }
                    reader.readAsDataURL(file)
                    setUploadedFields(prev => ({ ...prev, [fieldId]: true }))
                    toast.success(`Foto ${fieldId.replace('entrada_', '')} subida`)
                },
                onError: (error: Error) => {
                    setUploadedFields(prev => ({ ...prev, [fieldId]: false }))
                    toast.error(error.message || 'Error al subir la imagen')
                },
                onSettled: () => {
                    setUploadingFields(prev => ({ ...prev, [fieldId]: false }))
                }
            }
        )
    }
 
    const isAnyUploading  = Object.values(uploadingFields).some(Boolean)
    const todasSubidas    = FOTOS_ENTRADA.every(f => uploadedFields[f.id])
    const checklistId     = data?.checklist?.id
 
    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    )
 
    if (!data) return null
    
    return (
        <div className=" max-w-3xl mx-auto pb-24 px-4">
            <Link 
                to="/vigilancia"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors no-underline mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                Volver a unidades en ruta
            </Link>

            <div className=" flex items-start gap-3 mb-6">
                <div className=" w-10 h-10 bg-[#e8edf5] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheckIcon className="w-5 h-5 text-[#0f1f3d]" />
                </div>
                <div>
                    <h1 className=" text-2xl font-medium text-gray-900">Registro de entrada - Unidad {data.unidad.no_unidad}</h1>
                    {data.operador && (
                        <p className=" text-sm text-gray-500 mt-0.5">
                            Operador: {data.operador.nombre} {data.operador.apellido_p} {data.operador.apellido_m}
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
                <h2 className=" text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">Fotografías de Entrada</h2>
                <p className="text-xs text-gray-400 mb-4">Las 4 fotos son obligatorias para registrar la entrada</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {FOTOS_ENTRADA.map(f => (
                        <div
                            key={f.id}
                            className="bg-white rounded-xl border  border-gray-200 p-2"
                        >
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 truncate">{f.label}</p>
                            <div className=" relative h-28 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden rounded-lg group">
                                <input 
                                    type="file" 
                                    onChange={(e) => handleChange(e, f.id)}
                                    accept=".jpeg,.jpg,.png"
                                    capture="environment"
                                    disabled={isAnyUploading}
                                    className={`absolute inset-0 opacity-0 z-20 ${isAnyUploading ? 'pointer-events-none': 'cursor-pointer'}`}
                                />
                                {imageUrls[f.id] ? (
                                    <>
                                        <img src={imageUrls[f.id]!} className=" object-cover w-full h-full" alt={f.label} />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className=" text-white text-[10px] font-bold">Cambiar</span>
                                        </div>
                                        {!uploadingFields[f.id] && (
                                            <div className=" absolute bottom-0 left-0 right-0 bg-emerald-500/80 py-1 flex items-center justify-center gap-1 z-10">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className=" text-white text-[9px] font-bold uppercase">Subida</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className=" text-3xl text-gray-200">+</span>
                                )}
                                {uploadingFields[f.id] && (
                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold text-blue-600">SUBIENDO...</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <div className=" flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Progreso</span>
                        <span>{FOTOS_ENTRADA.filter(f => uploadedFields[f.id]).length}/{FOTOS_ENTRADA.length}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {FOTOS_ENTRADA.map(f => (
                            <div key={f.id} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${uploadedFields[f.id] ? 'bg-green-400' : 'bg-gray-200'}`} />

                        ))}
                    </div>
                </div>
            </div>

            {/* Fotos opcionales de detalle */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Fotografías de Detalle
                </h2>
                <p className="text-xs text-gray-400 mb-4">Opcionales — daños, detalles o cualquier novedad de la unidad</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }, (_, i) => {
                        const fieldId = `entrada_detalle_${i + 1}`
                        return (
                            <div key={fieldId} className="bg-white rounded-xl border border-gray-200 p-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Detalle {i + 1}</p>
                                <div className="relative h-24 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden rounded-lg group">
                                    <input
                                        type="file"
                                        accept=".jpeg,.jpg,.png"
                                        capture="environment"
                                        disabled={isAnyUploading}
                                        onChange={e => handleChange(e, fieldId)}
                                        className={`absolute inset-0 opacity-0 z-20 ${isAnyUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
                                    />
                                    {imageUrls[fieldId] ? (
                                        <>
                                            <img src={imageUrls[fieldId]!} className="object-cover w-full h-full" alt={`Detalle ${i + 1}`} />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-[10px] font-bold">Cambiar</span>
                                            </div>
                                            {!uploadingFields[fieldId] && (
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
                                    {uploadingFields[fieldId] && (
                                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                            SUBIENDO...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className=" bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones de entrada<span className="text-gray-400 font-normal ml-1">(opcional)</span></label>
                <textarea 
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    placeholder="Anota cualquier novedad o daño observado en la unidad al entrar al patio..."
                    rows={3}
                    className=" w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#0f1f3d]/20 focus:border-[#0f1f3d] resize-none placeholder-gray-300 transition-all"
                />
            </div>

            {todasSubidas && checklistId && (
                <button
                    onClick={() => finalizarMutation.mutate({
                        asignacionId: +asignacionId!,
                        checklistId,
                        observaciones: observaciones.trim() || undefined
                    })}
                    disabled={finalizarMutation.isPending || isAnyUploading}
                    className="w-full bg-[#0f1f3d] text-white font-semibold py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {finalizarMutation.isPending ? 'Registrando entrada...' : 'Registrar entrada y cerrar asignación'}
                </button>
            )}

            {!todasSubidas && (
                <p className=" text-center text-xs text-gray-400 mt-2">Sube las {FOTOS_ENTRADA.length - FOTOS_ENTRADA.filter(f => uploadedFields[f.id]).length} foto(s) restantes para habilitar el cierre de asignación</p>
            )}
        </div>
    )
}
