import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MotivoDevolucion } from "../../../types/asignacion";
import { devolverAsignacion } from "../../../api/AsignacionAPI";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";

type ModalDevolverAsignacionProps = {
    isOpen: boolean;
    onClose: () => void;
    asignacionId: number;
    noUnidad: string;
}

export default function ModalDevolverAsignacion({ isOpen, onClose, asignacionId, noUnidad }: ModalDevolverAsignacionProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [motivoDevolucion, setMotivoDevolucion] = useState<MotivoDevolucion>("CAMBIO_UNIDAD");
    const [observacionesDevolucion, setObservacionesDevolucion] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: devolverAsignacion,
        onError: (error) => toast.error(error.message),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
            queryClient.invalidateQueries({ queryKey: ["unidades"] });
            queryClient.invalidateQueries({ queryKey: ["operadores"] });
            queryClient.invalidateQueries({ queryKey: ["cajas"] });
            onClose();
            navigate("/");
        }
    });

    const handleDevolver = () => {
        if (motivoDevolucion === "OTRO" && !observacionesDevolucion.trim()) {
            toast.warning("Las observaciones son obligatorias si seleccionas 'OTRO'");
            return;
        }

        mutate({
            asignacionId,
            motivoDevolucion,
            observacionesDevolucion: observacionesDevolucion.trim() || undefined
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className={"relative z-50"} onClose={onClose}>
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
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className={"text-base font-semibold text-gray-900"}>
                                            Devolver Unidad {noUnidad}
                                        </Dialog.Title>
                                        <p className="text-xs text-gray-500">Cierra la asignacion del operador y libera la unidad</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Motivo de la devolución <span className="text-red-500">*</span></label>
                                        <select
                                            value={motivoDevolucion}
                                            onChange={e => setMotivoDevolucion(e.target.value as MotivoDevolucion)}
                                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none bg-white focus:border-[#0f1f3d]"
                                        >
                                            <option value="CAMBIO_UNIDAD">Cambio de unidad</option>
                                            <option value="RENUNCIA">Renuncia del operador</option>
                                            <option value="DESPIDO">Despido del operador</option>
                                            <option value="OTRO">Otro motivo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones de entrega {motivoDevolucion === 'OTRO' && <span className="text-red-500">*</span>}</label>
                                        <textarea 
                                            rows={3}
                                            value={observacionesDevolucion}
                                            onChange={e => setObservacionesDevolucion(e.target.value)}
                                            placeholder="Detalla el como entrega la unidad y el estado fisíco"
                                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none resize-none focus:border-[#0f1f3d]"
                                        />
                                    </div>
                                </div>

                                 <div className="mt-6 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDevolver}
                                        disabled={isPending}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                                    >
                                        {isPending ? "Devolviendo..." : "Confirmar Devolución"}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
