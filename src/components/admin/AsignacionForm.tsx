import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ui/ErrorMessage";
import { AsignacionFormData, CajasBase, OperadoresBase, UnidadesBase } from "../../types";

type AsignacionFormProps = {
    register: UseFormRegister<AsignacionFormData>
    errors: FieldErrors<AsignacionFormData>
    unidades: UnidadesBase
    cajas: CajasBase
    operadores: OperadoresBase
    cajaDisabled: boolean
    cajaExterna: boolean
    onCajaExterna: (checked: boolean) => void
}

export default function AsignacionForm({ errors, register, unidades, cajas, operadores, cajaDisabled, cajaExterna, onCajaExterna }: AsignacionFormProps) {
    return (
        <div className="space-y-5">

            {/* Unidad */}
            <div>
                <label htmlFor="unidadId" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Número de unidad <span className="text-red-500">*</span>
                </label>
                <select
                    id="unidadId"
                    {...register("unidadId", { required: "Seleccione una unidad" })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors bg-white ${
                        errors.unidadId
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#0f1f3d]'
                    }`}
                >
                    <option value="">-- Seleccione una unidad --</option>
                    {unidades.map(unidad => (
                        <option key={unidad.id} value={unidad.id}>
                            {unidad.no_unidad} · {unidad.tipo_unidad} · {unidad.u_placas}
                        </option>
                    ))}
                </select>
                {errors.unidadId && <ErrorMessage>{errors.unidadId.message}</ErrorMessage>}
            </div>

            {/* Remolque */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="cajaId" className={`block text-sm font-medium ${cajaDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                        Remolque
                        {cajaDisabled && <span className="ml-2 text-xs text-gray-400">(No aplica para este tipo de unidad)</span>}
                        {!cajaDisabled && !cajaExterna && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {/* Checkbox caja externa — solo visible para tractocamión */}
                    {!cajaDisabled && (
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={cajaExterna}
                                onChange={e => onCajaExterna(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#0f1f3d]"
                            />
                            Recoge en patio externo
                        </label>
                    )}
                </div>

                <select
                    id="cajaId"
                    disabled={cajaDisabled || cajaExterna}
                    {...register("cajaId", {
                        validate: (value) => {
                            if (!cajaDisabled && !cajaExterna && !value) return "Seleccione un remolque"
                            return true
                        }
                    })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors bg-white ${
                        cajaDisabled || cajaExterna
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : errors.cajaId
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-gray-200 focus:border-[#0f1f3d]'
                    }`}
                >
                    <option value="">
                        {cajaExterna ? 'Recoge remolque en patio externo' : '-- Seleccione un remolque --'}
                    </option>
                    {!cajaExterna && cajas.map(caja => caja && (
                        <option key={caja.id} value={caja.id}>
                            {caja.numero_caja} · {caja.c_placas} · {caja.c_marca}
                        </option>
                    ))}
                </select>
                {errors.cajaId && <ErrorMessage>{errors.cajaId.message}</ErrorMessage>}

                {cajaExterna && (
                    <p className="text-xs text-amber-600 mt-1.5">
                        El remolque se asignará cuando la unidad regrese al patio
                    </p>
                )}
            </div>

            {/* Operador */}
            <div>
                <label htmlFor="operadorId" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Operador <span className="text-red-500">*</span>
                </label>
                <select
                    id="operadorId"
                    {...register("operadorId", { required: "Seleccione un operador" })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors bg-white ${
                        errors.operadorId
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#0f1f3d]'
                    }`}
                >
                    <option value="">-- Seleccione un operador --</option>
                    {operadores.map(operador => (
                        <option key={operador.id} value={operador.id}>
                            {operador.apellido_p} {operador.apellido_m} {operador.nombre}
                        </option>
                    ))}
                </select>
                {errors.operadorId && <ErrorMessage>{errors.operadorId.message}</ErrorMessage>}
            </div>
        </div>
    )
}