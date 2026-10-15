import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { actualizarCaja, getCajas } from "../../../api/AsignacionAPI";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";

type ModalCambioCajaProps = {
    isOpen: boolean;
    onClose: () => void;
    asignacionId: number;
    cajaActualId?: number | null;
}

export default function ModalCambioCaja({ isOpen, onClose, asignacionId, cajaActualId }: ModalCambioCajaProps) {

    const queryClient = useQueryClient();
    const [cajaId, setCajaId] = useState<number | "">("");
    const [motivo, setMotivo] = useState("FALLA_MECANICA");
    const [observaciones, setObservaciones] = useState("");

    const [confirmacionTraspaso, setConfirmacionTraspaso] = useState<{
        requiere: boolean;
        mensaje: string;
        unidadConflicto: string;
    } | null>(null);

    const { data: cajas, isLoading: loadingCajas } = useQuery({
        queryKey: ["cajas"],
        queryFn: () => getCajas(),
        enabled: isOpen
    });

    const { mutate, isPending } = useMutation({
        mutationFn: actualizarCaja,
        onError: (error) => toast.error(error.message),
        onSuccess: (res: any) => {
            if (res?.requiereConfirmacion) {
                setConfirmacionTraspaso({
                    requiere: true,
                    mensaje: res.mensaje,
                    unidadConflicto: res.unidadConflicto
                });
                return;
            }

            // Flujo normal de éxito:
            toast.success(res?.message || "Remolque actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["Asignacion", asignacionId] });
            queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
            queryClient.invalidateQueries({ queryKey: ["cajas"] });
            handleCerrar();
        }
    });

    const handleCerrar = () => {
        setCajaId("");
        setObservaciones("");
        setConfirmacionTraspaso(null);
        onClose();
    };

    const handleSubmit = (forzarTraspaso = false) => {
        if (!cajaId) {
            toast.warning("Selecciona un remolque");
            return;
        }

        mutate({
            asignacionId,
            cajaId: Number(cajaId),
            motivo,
            observaciones: observaciones.trim() || undefined,
            confirmarTraspaso: forzarTraspaso
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className={"relative z-50"} onClose={handleCerrar}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={"w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100"}>
                                <Dialog.Title as="h3" className={"text-base font-semibold text-gray-900 mb-1"}>
                                    Cambiar Remolque de la Unidad
                                </Dialog.Title>
                                <p className="text-xs text-gray-500 mb-5">
                                    Registra el enganche y asocia un nuevo remolque con auditoría
                                </p>
                                {confirmacionTraspaso ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                                            <span className="">⚠️</span> Confirmar Traspaso de Patio
                                        </div>
                                        <p className="text-xs text-amber-800">
                                            {confirmacionTraspaso.mensaje}
                                        </p>

                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfirmacionTraspaso(null)}
                                                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSubmit(true)}
                                                disabled={isPending}
                                                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                                            >
                                                {isPending ? "Transfiriendo..." : "Sí, Transferir Remolque"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Nuevo Remolque <span className="text-red-500">*</span>
                                            </label>
                                            {loadingCajas ? (
                                                <p className="text-xs text-gray-400">Cargando remolques...</p>
                                            ) : (
                                                <select
                                                    value={cajaId}
                                                    onChange={e => setCajaId(Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-[#0f1f3d]"
                                                >
                                                    <option value="">-- Selecciona un remolque --</option>
                                                    {cajas?.filter(c => c.id !== cajaActualId).map( caja => (
                                                        <option value={caja.id} key={caja.id}>
                                                            Caja {caja.numero_caja} ({caja.c_placas})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Motivo Cambio</label>
                                            <select
                                                value={motivo}
                                                onChange={e => setMotivo(e.target.value)}
                                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-[#0f1f3d]"
                                            >
                                                <option value="FALLA_MECANICA">Falla mecánica</option>
                                                <option value="FILTRACION">Filtración</option>
                                                <option value="TRASPASO_PATIO">Traspaso operativo en patio</option>
                                                <option value="OTRO">Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
                                            <textarea 
                                                rows={2}
                                                value={observaciones}
                                                onChange={e => setObservaciones(e.target.value)}
                                                placeholder="Ej. Se cambió por ponchadura de llanta trasera"
                                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none resize-none focus:border-[#0f1f3d]"
                                            />
                                        </div>

                                        <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCerrar}
                                                className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSubmit(false)}
                                                disabled={isPending || !cajaId}
                                                className="px-4 py-2 text-xs font-semibold text-white bg-[#0f1f3d] hover:bg-[#1a3a6b] rounded-lg transition-colors disabled:bg-gray-300 shadow-sm"
                                            >
                                                {isPending ? "Guardando..." : "Actualizar Remolque"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
