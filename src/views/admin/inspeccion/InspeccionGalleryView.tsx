import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getInspeccionById } from '../../../api/InspeccionAPI';
import GaleriaFotos from '../../../components/admin/GaleriaFotos';

export default function InspeccionGalleryView() {
    const { inspeccionId } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['Inspeccion', +inspeccionId!],
        queryFn: () => getInspeccionById(+inspeccionId!)
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400 text-sm">Cargando galería...</p>
        </div>
    );

    const identificador = data?.tipo === 'REMOLQUE'
        ? `Remolque ${data.caja?.numero_caja ?? ''}`
        : `Unidad ${data?.unidad?.no_unidad ?? ''}`;

    return (
        <GaleriaFotos
            imagenes={data?.imagenes ?? []}
            titulo={`Galería — ${identificador}`}
            subtitulo={`${data?.imagenes?.length ?? 0} imágenes registradas`}
            backTo={`/inspecciones/${inspeccionId}`}
        />
    );
}