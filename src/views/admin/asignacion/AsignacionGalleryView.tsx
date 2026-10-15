import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import GaleriaFotos from "../../../components/admin/GaleriaFotos";

export default function AsignacionGalleryView() {
    const { asignacionId, recorridoId } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando galería...</p>
        </div>
    );

    const recorrido = recorridoId ? data?.recorridos.find(r => r.id === +recorridoId) : null;
    const imagenes = recorrido ? (recorrido.checklist?.imagenes ?? []) : (data?.recorridos ?? []).flatMap((r: any) => r.checklist?.imagenes ?? []);

    return (
        <GaleriaFotos
            imagenes={imagenes}
            subtitulo={`Asignación #${asignacionId} · ${imagenes.length} imágenes`}
            backTo={recorridoId ? `/asignacion/${asignacionId}/recorridos/${recorridoId}` : `/asignacion/${asignacionId}`}
        />
    );
}