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
}

export default function AsignacionForm({ errors, register, unidades, cajas, operadores, cajaDisabled }: AsignacionFormProps) {
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
                <label htmlFor="cajaId" className={`block text-sm font-medium mb-1.5 ${cajaDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    Remolque
                    {cajaDisabled && <span className="ml-2 text-xs text-gray-400">(No aplica para este tipo de unidad)</span>}
                    {!cajaDisabled && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                    id="cajaId"
                    disabled={cajaDisabled}
                    {...register("cajaId", {
                        validate: (value) => {
                            if (!cajaDisabled && !value) return "Seleccione un remolque"
                            return true
                        }
                    })}
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors bg-white ${
                        cajaDisabled
                            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : errors.cajaId
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-gray-200 focus:border-[#0f1f3d]'
                    }`}
                >
                    <option value="">-- Seleccione un remolque --</option>
                    {cajas.map(caja => (
                        <option key={caja.id} value={caja.id}>
                            {caja.c_placas} · {caja.c_marca}
                        </option>
                    ))}
                </select>
                {errors.cajaId && <ErrorMessage>{errors.cajaId.message}</ErrorMessage>}
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