import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom"
import { getAsignacionById } from "../../../api/AsignacionAPI";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { finalizarFotos, uploadImage } from "../../../api/ChecklistAPI";
import { CONFIG_ASIGNACION } from "../../../types/imageUpload";
import { toast } from "react-toastify";
import ImageUploadGrid from "../../../components/admin/image/ImageUploadGrid";

export default function ChecklistImageUploadView() {

    const { asignacionId, recorridoId, checklistId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    const recorridoActual = data?.recorridos?.find((r: any) => r.id === +recorridoId!);
    const imagenesExistentes = recorridoActual?.checklist?.imagenes;

    const { imageUrls, uploadedFields, uploadingFields, isAnyUploading, canFinalize, handleUpload } = useImageUpload({
        imagenesExistentes,
        uploadFn: ({ file, fieldId }) => uploadImage({ 
            file, 
            asignacionId: +asignacionId!, 
            recorridoId: +recorridoId!,
            checklistId: +checklistId!, 
            fieldId 
        }),
        obligatorias: CONFIG_ASIGNACION.obligatorias,
        conFirma: true,
    });

    const { mutate: finalizar, isPending } = useMutation({
        mutationFn: finalizarFotos,
        onSuccess: () => {
            toast.success('Asignación Finalizada Correctamente');
            queryClient.invalidateQueries({ queryKey: ['Asignacion', +asignacionId!] });
            queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
            navigate(`/asignacion/${asignacionId}`);
        },
        onError: (error) => toast.error(error.message)
    });

    if(isLoading) return <p className="text-center py-20 text-gray-500">Cargando datos...</p>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6 px-4 pt-6">
                <div className="mb-2">
                    <Link
                        to={`/asignacion/${asignacionId}`}
                        className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 no-underline"
                    >
                        ← Volver a la asignación
                    </Link>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Paso 2: Fotografìas y Firma</h1>
                <p className="text-sm text-gray-500 mt-0.5">Captura las imágenes obligatorias para autorizar la salida</p>
            </div>

            <ImageUploadGrid 
                config={CONFIG_ASIGNACION}
                imageUrls={imageUrls}
                uploadedFields={uploadedFields}
                uploadingFields={uploadingFields}
                isAnyUploading={isAnyUploading}
                canFinalize={canFinalize}
                isPending={isPending}
                onFileChange={handleUpload}
                onSaveSignature={(file) => handleUpload(file, 'firma')}
                onFinalizar={() => finalizar({ 
                    asignacionId: +asignacionId!, 
                    recorridoId: +recorridoId!, 
                    checklistId: +checklistId! 
                })}
                labelFinalizar="Finalizar fotos y autorizar salida"
            />
        </div>
    )
}
