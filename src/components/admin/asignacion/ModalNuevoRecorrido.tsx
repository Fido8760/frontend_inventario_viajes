import { useNavigate } from "react-router-dom";
import { Caja } from "../../../types/caja";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import { iniciarRecorrido } from "../../../api/RecorridoAPI";

type ModalNuevoRecorridoProps = {
    isOpen: boolean;
    onClose: () => void;
    asignacionId: number;
    cajaActual?: Caja | null;
    tipoUnidad: string;
}

export default function ModalNuevoRecorrido({ isOpen, onClose, asignacionId, cajaActual, tipoUnidad }: ModalNuevoRecorridoProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [saleAViaje, setSaleAViaje] = useState(true);
    const [cajaExterna, setCajaExterna] = useState(false);

    const esTractocamion = tipoUnidad === "TRACTOCAMION";

       const { mutate, isPending } = useMutation({
        mutationFn: iniciarRecorrido,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["Asignacion", asignacionId] });
            queryClient.invalidateQueries({ queryKey: ["asignaciones"] });
            onClose();
            navigate(`/asignacion/${asignacionId}/recorridos/${data.recorridoId}/checklist/${data.checklistId}`);
        }
    });

    const handleIniciar = () => {
        mutate({
            asignacionId,
            saleAViaje,
            caja_externa: esTractocamion ? cajaExterna : false,
            cajaId: esTractocamion && !cajaExterna ? (cajaActual?.id ?? null) : null
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                
                                {/* Título */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-[#e8edf5] flex items-center justify-center text-[#0f1f3d]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-base font-semibold text-gray-900">
                                            Iniciar Nuevo Viaje
                                        </Dialog.Title>
                                        <p className="text-xs text-gray-500">Configura los detalles antes de la inspección</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* 1. ¿Sale a Carretera o Solo Entrega? */}
                                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                            Tipo de Recorrido
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSaleAViaje(true)}
                                                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                                                    saleAViaje
                                                        ? 'bg-[#0f1f3d] text-white border-[#0f1f3d] shadow-sm'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                🛣️ Salida a Carretera
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSaleAViaje(false)}
                                                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                                                    !saleAViaje
                                                        ? 'bg-[#0f1f3d] text-white border-[#0f1f3d] shadow-sm'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                🏢 Solo Entrega en Patio
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-2">
                                            {saleAViaje
                                                ? "Al finalizar fotos, la unidad se pondrá en estado EN RUTA."
                                                : "Al finalizar fotos, la unidad quedará en estado COMPLETA lista en patio."}
                                        </p>
                                    </div>

                                    {/* 2. Remolque (Solo para Tractocamiones) */}
                                    {esTractocamion && (
                                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                                Remolque para este viaje
                                            </label>

                                            <div className="space-y-2">
                                                <label className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                    !cajaExterna ? 'bg-white border-[#0f1f3d] text-gray-900 font-medium' : 'border-transparent text-gray-500'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="remolque"
                                                        checked={!cajaExterna}
                                                        onChange={() => setCajaExterna(false)}
                                                        className="accent-[#0f1f3d]"
                                                    />
                                                    <span>
                                                        {cajaActual 
                                                            ? `Lleva caja asignada: Caja ${cajaActual.numero_caja} (${cajaActual.c_placas})` 
                                                            : 'Sin remolque asignado'}
                                                    </span>
                                                </label>

                                                <label className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                    cajaExterna ? 'bg-white border-[#0f1f3d] text-gray-900 font-medium' : 'border-transparent text-gray-500'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="remolque"
                                                        checked={cajaExterna}
                                                        onChange={() => setCajaExterna(true)}
                                                        className="accent-[#0f1f3d]"
                                                    />
                                                    <span>Recoge remolque en patio externo / vacío</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de Acción */}
                                <div className="mt-6 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleIniciar}
                                        disabled={isPending}
                                        className="px-4 py-2 text-xs font-medium text-white bg-[#0f1f3d] hover:bg-[#1a3a6b] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                    >
                                        {isPending ? 'Creando viaje...' : 'Comenzar Inspección →'}
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
