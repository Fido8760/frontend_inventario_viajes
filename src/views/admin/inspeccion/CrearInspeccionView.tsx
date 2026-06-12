import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { crearInspeccion, } from '../../../api/InspeccionAPI';
import { getUnidades, getCajas } from '../../../api/AsignacionAPI';
import { inspeccionFormSchema, InspeccionFormData } from '../../../types';

export default function CrearInspeccionView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tipo, setTipo] = useState<'UNIDAD' | 'REMOLQUE' | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<InspeccionFormData>({
        resolver: zodResolver(inspeccionFormSchema),
        defaultValues: { tipo: undefined, unidadId: null, cajaId: null }
    });

    const { data: unidades, isLoading: loadingUnidades } = useQuery({
        queryKey: ['Unidades'],
        queryFn: getUnidades,
        enabled: tipo === 'UNIDAD',
    });

    const { data: cajas, isLoading: loadingCajas } = useQuery({
        queryKey: ['Cajas'],
        queryFn: getCajas,
        enabled: tipo === 'REMOLQUE',
    });

    const { mutate, isPending } = useMutation({
        mutationFn: crearInspeccion,
        onError: (error) => toast.error(error.message),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ['Inspecciones'] });
            navigate(`/inspecciones/${data.id}/checklist`);
        }
    });

    const handleSelectTipo = (t: 'UNIDAD' | 'REMOLQUE') => {
        setTipo(t);
        setValue('tipo', t);
        setValue('unidadId', null);
        setValue('cajaId', null);
    };

    const onSubmit = (formData: InspeccionFormData) => mutate(formData);

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Nueva inspección</h1>
                <p className="text-sm text-gray-500 mt-0.5">Selecciona el tipo e identifica la unidad a inspeccionar</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Tipo de inspección</h2>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Selector de tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        {(['UNIDAD', 'REMOLQUE'] as const).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleSelectTipo(t)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                                    tipo === t
                                        ? 'border-[#0f1f3d] bg-[#e8edf5]'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tipo === t ? 'bg-[#0f1f3d]' : 'bg-gray-100'
                                }`}>
                                    <svg className={`w-5 h-5 ${tipo === t ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d={t === 'REMOLQUE'
                                                ? "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                                                : "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                            }
                                        />
                                    </svg>
                                </div>
                                <span className={`text-sm font-medium ${tipo === t ? 'text-[#0f1f3d]' : 'text-gray-600'}`}>
                                    {t === 'UNIDAD' ? 'Unidad' : 'Remolque'}
                                </span>
                                <span className="text-xs text-gray-400 text-center">
                                    {t === 'UNIDAD'
                                        ? 'Tracto, mudancero o camioneta'
                                        : 'Caja o remolque de patio'
                                    }
                                </span>
                            </button>
                        ))}
                    </div>
                    {errors.tipo && (
                        <p className="text-xs text-red-500">{errors.tipo.message}</p>
                    )}

                    {/* Selector de unidad */}
                    {tipo === 'UNIDAD' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Unidad <span className="text-red-500">*</span>
                            </label>
                            {loadingUnidades ? (
                                <p className="text-xs text-gray-400">Cargando unidades...</p>
                            ) : (
                                <select
                                    {...register('unidadId', { valueAsNumber: true })}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                                        errors.unidadId
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#0f1f3d]'
                                    }`}
                                >
                                    <option value="">Selecciona una unidad</option>
                                    {unidades?.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.no_unidad} · {u.tipo_unidad} · {u.u_placas}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.unidadId && (
                                <p className="mt-1 text-xs text-red-500">{errors.unidadId.message}</p>
                            )}
                        </div>
                    )}

                    {/* Selector de caja */}
                    {tipo === 'REMOLQUE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Remolque / Caja <span className="text-red-500">*</span>
                            </label>
                            {loadingCajas ? (
                                <p className="text-xs text-gray-400">Cargando cajas...</p>
                            ) : (
                                <select
                                    {...register('cajaId', { valueAsNumber: true })}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                                        errors.cajaId
                                            ? 'border-red-300 focus:border-red-400 bg-red-50'
                                            : 'border-gray-200 focus:border-[#0f1f3d]'
                                    }`}
                                >
                                    <option value="">Selecciona una caja</option>
                                    {cajas?.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.numero_caja} · {c.c_marca} · {c.c_placas}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.cajaId && (
                                <p className="mt-1 text-xs text-red-500">{errors.cajaId.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/inspecciones')}
                        className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isPending || !tipo}
                        className="flex-1 text-sm text-white bg-[#0f1f3d] rounded-lg px-4 py-2.5 hover:bg-[#1a3a6b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? 'Creando...' : 'Crear inspección'}
                    </button>
                </div>
            </div>
        </div>
    );
}