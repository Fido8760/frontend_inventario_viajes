import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export type SeccionFlow = {
    nombre: string;
    preguntas: {
        preguntaId: number;
        texto: string;
        tipo: 'si_no' | 'opciones' | 'numero' | 'texto';
        obligatorio: boolean;
        aplica_a: 'todos' | 'tractocamion';
        valor: string | null;
    }[];
}

export type RespuestaFlow = {
    preguntaId: number;
    valor: string | null;
};

type UseChecklistFlowParams = {
    queryKey: unknown[];
    queryFn: () => Promise<any>;
    normalizeSecciones: (data: any) => SeccionFlow[];
    guardarFn: (respuestas: RespuestaFlow[]) => Promise<{ message: string }>;
    finalizarFn: () => Promise<{ message: string }>;
    onFinalizarSuccess: (data: { message: string }) => void;
    estaCompleto?: (data: any) => boolean;
};

export function useChecklistFlow({ queryKey, queryFn, normalizeSecciones, guardarFn,finalizarFn, onFinalizarSuccess, estaCompleto } : UseChecklistFlowParams) {
    const [seccionActual, setSeccionActual] = useState(0);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn,
        staleTime: 0
    });

    const { mutate: guardar, isPending: isGuardando } = useMutation({
        mutationFn: guardarFn,
        onError: (error) => toast.error(error.message),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const { mutate: finalizar, isPending: isFinalizando } = useMutation({
        mutationFn: finalizarFn,
        onError: (error) => toast.error(error.message),
        onSuccess: onFinalizarSuccess
    })

    const secciones = useMemo(() => {
        if(!data) return [];
        return normalizeSecciones(data);
    }, [data]);

    const totalSecciones = secciones.length;
    const esUltimaSeccion = seccionActual === totalSecciones - 1;
    const checklistCompleto = data ? (estaCompleto?.(data) ?? false) : false;

    const handleGuardarSeccion = (respuestas: RespuestaFlow[], avanzar: boolean) => {
        guardar(respuestas, {
            onSuccess: () => {
                if (avanzar && !esUltimaSeccion) {
                    setSeccionActual(s => s + 1);
                }
            }
        });
    };

    const handleFinalizar = (respuestas: RespuestaFlow[]) => {
        guardar(respuestas, {
            onSuccess: () => finalizar()
        });
    };

    return {   
        data,
        isLoading,
        isError,
        secciones,
        seccionActual,
        setSeccionActual,
        totalSecciones,
        esUltimaSeccion,
        checklistCompleto,
        isGuardando,
        isFinalizando,
        handleGuardarSeccion,
        handleFinalizar,
    }
}