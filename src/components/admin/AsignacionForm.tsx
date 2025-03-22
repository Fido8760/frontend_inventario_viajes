import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ui/ErrorMessage";
import { AsignacionFormData, Cajas, Operadores, Unidades } from "../../types";

type AsignacionFormProps = {
    register: UseFormRegister<AsignacionFormData>
    errors: FieldErrors<AsignacionFormData>
    unidades: Unidades
    cajas: Cajas
    operadores: Operadores
}

export default function AsignacionForm({errors, register, unidades, cajas, operadores}: AsignacionFormProps) {
    return (
        <>
            <div className="mb-5 space-y-3">
                <label htmlFor="unidadId" className="text-sm uppercase font-bold block">
                    Número de unidad
                </label>
                <select
                    id="unidadId"
                    {...register("unidadId", { 
                        required: "Seleccione una unidad"
                    })}
                    className="border p-2 w-full"
                >
                    <option value="" >--Seleccione--</option>
                    {unidades.map( unidad => (
                        <option key={unidad.id} value={unidad.id}>{unidad.no_unidad}</option>
                    ))}
                    
                </select>
                {errors.unidadId && (
                    <ErrorMessage>{errors.unidadId.message}</ErrorMessage>
                )}

            </div>

            <div className="mb-5 space-y-3">
                <label htmlFor="cajaId" className="text-sm uppercase font-bold">
                    Placa de Remolque
                </label>
                <select
                    id="cajaId"
                    {...register("cajaId", { 
                        required: "Seleccione un remolque"
                    })}
                    className="border p-2 w-full"
                >
                    <option value="" >--Seleccione--</option>
                    {cajas.map(caja => (
                        <option key={caja.id} value={caja.id} >{caja.c_placas}</option>
                    ))}
                </select>
                {errors.cajaId && (
                    <ErrorMessage>{errors.cajaId.message}</ErrorMessage>
                )}
            </div>

            <div className="mb-5 space-y-3">
                <label htmlFor="operadorId" className="text-sm uppercase font-bold">
                    Operador
                </label>
                <select
                    id="operadorId"
                    {...register("operadorId", { 
                        required: "Seleccione un operador"
                    })}
                    className="border p-2 w-full"
                >
                    <option value="" >--Seleccione--</option>
                    {operadores.map(operador => (
                        <option key={operador.id} value={operador.id}>{operador.nombre} {operador.apellido_p} {operador.apellido_m}</option>
                    ))}
                </select>
                {errors.operadorId && (
                    <ErrorMessage>{errors.operadorId.message}</ErrorMessage>
                )}
            </div>
        </>
    )
}