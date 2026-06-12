import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import { finalizarFotosInspeccion, getInspeccionById, uploadImageInspeccion } from "../../../api/InspeccionAPI";
import { CONFIG_INSPECCION_REMOLQUE, CONFIG_INSPECCION_UNIDAD } from "../../../types/imageUpload";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { toast } from "react-toastify";
import ImageUploadGrid from "../../../components/admin/image/ImageUploadGrid";

export default function InspeccionFotosView() {
    const { inspeccionId } = useParams();
    const navigate = useNavigate();
    const id = +inspeccionId!;

    const { data, isLoading } = useQuery({
        queryKey: ['Inspeccion', id],
        queryFn: () => getInspeccionById(id)
    });

    const config = data?.tipo === 'REMOLQUE' ? CONFIG_INSPECCION_REMOLQUE : CONFIG_INSPECCION_UNIDAD;

    const { imageUrls, uploadedFields, uploadingFields, isAnyUploading, canFinalize, handleUpload } = useImageUpload({
        imagenesExistentes: data?.imagenes,
        uploadFn: ({ file, fieldId }) => uploadImageInspeccion({ id, file, fieldId }),
        obligatorias: config.obligatorias,
        conFirma: false
    });

    const { mutate: finalizar, isPending } = useMutation({
        mutationFn: () => finalizarFotosInspeccion(id),
        onSuccess: (data) => {
            toast.success(data.message);
            navigate(`/inspecciones/${id}`);
        },
        onError: (error: any) => toast.error(error.message)
    });

    if(isLoading) return <p className="text-center py-20 text-gray-500">Cargando...</p>
    return (
        <div>
            <div className="mb-6 px-4 pt-6">
                <h1 className=" text-2xl font-semibold text-gray-900">Fotografías de Inspección</h1>
                <p className=" text-sm text-gray-500 mt-0.5">{data?.tipo === 'REMOLQUE' ? 'Remolque' : 'Unidad'} - sube las fotos obligatorias para completar la inspección</p>
            </div>
            <ImageUploadGrid 
                config={config}
                imageUrls={imageUrls}
                uploadedFields={uploadedFields}
                uploadingFields={uploadingFields}
                isAnyUploading={isAnyUploading}
                canFinalize={canFinalize}
                isPending={isPending}
                onFileChange={handleUpload}
                onFinalizar={() => finalizar()}
                labelFinalizar="Completar inspección"
            />
        </div>
    )
}
