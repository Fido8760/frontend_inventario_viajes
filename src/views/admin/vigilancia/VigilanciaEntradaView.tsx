import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import { registrarEntrada, uploadImage } from "../../../api/ChecklistAPI";
import { toast } from "react-toastify";
import { ArrowLeftIcon, ShieldCheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const FOTOS_ENTRADA = [
    { id: 'entrada_frontal',    label: 'Frontal' },
    { id: 'entrada_trasera',    label: 'Trasera' },
    { id: 'entrada_izquierdo',  label: 'Lateral Izquierdo' },
    { id: 'entrada_derecho',    label: 'Lateral Derecho' },
];

export default function VigilanciaEntradaView() {
    const { asignacionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>({});
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
    const [observaciones, setObservaciones] = useState('');

    // 💡 Estado para el Modo Alternativo: Cierre sin Fotos
    const [cierreSinFotos, setCierreSinFotos] = useState(false);
    const [motivoOmision, setMotivoOmision] = useState('OMISION_VIGILANCIA');

    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    // Encontrar el viaje que viene en ruta
    const asignacion = data?.asignacion;
    const recorridoEnRuta = data?.recorridos?.find((r: any) => r.status === 'EN_RUTA');
    const recorridoId = recorridoEnRuta?.id;
    const checklistId = recorridoEnRuta?.checklist?.id;

    // Precargar fotos si ya se habían subido
    useEffect(() => {
        if (recorridoEnRuta?.checklist?.imagenes) {
            const urls: Record<string, string> = {};
            const uploaded: Record<string, boolean> = {};
            recorridoEnRuta.checklist.imagenes.forEach((img: any) => {
                urls[img.fieldId] = img.urlImagen;
                uploaded[img.fieldId] = true;
            });
            setImageUrls(urls);
            setUploadedFields(uploaded);
        }
    }, [recorridoEnRuta]);

    const uploadMutation = useMutation({
        mutationFn: uploadImage,
        onError: (error: Error) => toast.error(error.message || 'Error al subir la imagen')
    });

    const finalizarMutation = useMutation({
        mutationFn: registrarEntrada,
        onSuccess: (res) => {
            toast.success(res?.message || 'Entrada registrada y viaje cerrado correctamente');
            queryClient.invalidateQueries({ queryKey: ['asignaciones-en-ruta'] });
            queryClient.invalidateQueries({ queryKey: ['Asignacion', +asignacionId!] });
            queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
            navigate('/vigilancia');
        },
        onError: (error: Error) => toast.error(error.message)
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        if (uploadingFields[fieldId] || !recorridoId || !checklistId) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFields(prev => ({ ...prev, [fieldId]: true }));
        const reader = new FileReader();

        uploadMutation.mutate(
            { 
                file, 
                asignacionId: +asignacionId!, 
                recorridoId, 
                checklistId, 
                fieldId 
            },
            {
                onSuccess: () => {
                    reader.onloadend = () => {
                        setImageUrls(prev => ({ ...prev, [fieldId]: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                    setUploadedFields(prev => ({ ...prev, [fieldId]: true }));
                    toast.success(`Foto ${fieldId.replace('entrada_', '')} subida`);
                },
                onSettled: () => {
                    setUploadingFields(prev => ({ ...prev, [fieldId]: false }));
                }
            }
        );
    };

    const isAnyUploading = Object.values(uploadingFields).some(Boolean);
    const todasSubidas   = FOTOS_ENTRADA.every(f => uploadedFields[f.id]);

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando datos de la unidad en ruta...</p>
        </div>
    );

    if (!data || !asignacion) return null;

    if (!recorridoEnRuta) return (
        <div className="max-w-md mx-auto py-32 text-center">
            <p className="text-sm font-semibold text-gray-700">Esta unidad no tiene ningún viaje en ruta activo.</p>
            <Link to="/vigilancia" className="text-xs text-blue-600 underline mt-2 block">
                Volver a la lista
            </Link>
        </div>
    );

    const handleConfirmarCierre = () => {
        if (!recorridoId || !checklistId) {
            toast.error("No se encontró el viaje o checklist activo");
            return;
        }
        if (cierreSinFotos && !observaciones.trim()) {
            toast.warning("Para cerrar sin fotos, las observaciones/motivo son obligatorias");
            return;
        }

        finalizarMutation.mutate({
            asignacionId: +asignacionId!,
            recorridoId,
            checklistId,
            observaciones: observaciones.trim() || undefined,
            cierreSinFotos,
            motivoOmision: cierreSinFotos ? motivoOmision : undefined
        });
    };

    return (
        <div className="max-w-3xl mx-auto pb-24 px-4">
            <Link 
                to="/vigilancia"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors no-underline mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                Volver a unidades en ruta
            </Link>

            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-[#e8edf5] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheckIcon className="w-5 h-5 text-[#0f1f3d]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Cierre de Viaje · Unidad {asignacion.unidad.no_unidad}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Operador: {asignacion.operador ? `${asignacion.operador.nombre} ${asignacion.operador.apellido_p}` : 'Sin asignar'}
                        {asignacion.caja ? ` · Remolque: Caja ${asignacion.caja.numero_caja}` : ''}
                    </p>
                </div>
            </div>

            {/* ── Switch Modo Cierre sin Fotos (Solución al olvido) ───────── */}
            <div className={`p-4 rounded-2xl border transition-all mb-6 ${
                cierreSinFotos 
                    ? 'bg-amber-50 border-amber-200 shadow-sm' 
                    : 'bg-white border-gray-100 shadow-sm'
            }`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <ExclamationTriangleIcon className={`w-5 h-5 shrink-0 ${cierreSinFotos ? 'text-amber-600' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs font-bold text-gray-900">
                                ¿La unidad ya no está en caseta o no se capturaron fotos?
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                Activa esta opción para realizar un cierre administrativo auditado sin fotografías.
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={cierreSinFotos}
                            onChange={(e) => setCierreSinFotos(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                </div>

                {/* Campos obligatorios si activa el cierre sin fotos */}
                {cierreSinFotos && (
                    <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-amber-900 mb-1">
                                Motivo de omisión de fotografías <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={motivoOmision}
                                onChange={(e) => setMotivoOmision(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg outline-none bg-white text-gray-800"
                            >
                                <option value="OMISION_VIGILANCIA">Vigilancia omitió captura al entrar</option>
                                <option value="UNIDAD_FORANEA">Unidad en patio foráneo / descarga externa</option>
                                <option value="INGRESO_NOCTURNO">Ingreso nocturno sin personal de caseta</option>
                                <option value="OTRO">Otro motivo operativo</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Subida de Fotos Normal (Solo si NO es cierre sin fotos) ───── */}
            {!cierreSinFotos && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Fotografías de Entrada (Obligatorias)
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">Captura las 4 esquinas de la unidad al llegar a caseta</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FOTOS_ENTRADA.map(f => (
                            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 truncate">{f.label}</p>
                                <div className="relative h-28 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden rounded-lg group">
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
                                            <img src={imageUrls[f.id]!} className="object-cover w-full h-full" alt={f.label} />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-[10px] font-bold">Cambiar</span>
                                            </div>
                                            {!uploadingFields[f.id] && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 py-0.5 flex items-center justify-center gap-1 z-10 text-white text-[9px] font-bold">
                                                    ✓ SUBIDA
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-2xl text-gray-300">+</span>
                                    )}
                                    {uploadingFields[f.id] && (
                                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                            SUBIENDO...
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>Progreso de fotos:</span>
                        <span className="font-semibold text-gray-700">
                            {FOTOS_ENTRADA.filter(f => uploadedFields[f.id]).length} de {FOTOS_ENTRADA.length}
                        </span>
                    </div>
                </div>
            )}

            {/* Observaciones */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Observaciones de llegada {cierreSinFotos ? <span className="text-red-500">* (Obligatorias para auditoría)</span> : <span className="text-gray-400 font-normal">(Opcional)</span>}
                </label>
                <textarea 
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    placeholder={cierreSinFotos 
                        ? "Detalla por qué no se tomaron fotos y confirma que la unidad ya está en patio..." 
                        : "Anota cualquier novedad, daño o reporte físico al entrar al patio..."}
                    rows={3}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#0f1f3d] resize-none placeholder-gray-300 transition-all"
                />
            </div>

            {/* Botón de Cierre */}
            <button
                type="button"
                onClick={handleConfirmarCierre}
                disabled={finalizarMutation.isPending || isAnyUploading || (!cierreSinFotos && !todasSubidas)}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                    cierreSinFotos
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-[#0f1f3d] hover:bg-[#1a3a6b] text-white'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
                {finalizarMutation.isPending 
                    ? 'Procesando cierre...' 
                    : cierreSinFotos 
                        ? 'Cerrar Viaje Administrativamente (Sin Fotos) →' 
                        : 'Registrar Entrada con Fotos y Cerrar Viaje →'}
            </button>

            {!cierreSinFotos && !todasSubidas && (
                <p className="text-center text-xs text-gray-400 mt-2">
                    Sube las 4 fotos obligatorias o activa el cierre sin fotos arriba si la unidad ya no está en caseta.
                </p>
            )}
        </div>
    );
}