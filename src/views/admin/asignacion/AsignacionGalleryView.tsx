import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getAsignacionById } from "../../../api/AsignacionAPI";
import GaleriaFotos from "../../../components/admin/GaleriaFotos";

export default function AsignacionGalleryView() {
    const { asignacionId } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando galería...</p>
        </div>
    );

    return (
        <GaleriaFotos
            imagenes={data?.checklist?.imagenes ?? []}
            subtitulo={`Asignación #${asignacionId} · ${data?.checklist?.imagenes?.length ?? 0} imágenes`}
            backTo={`/asignacion/${asignacionId}`}
        />
    );
}