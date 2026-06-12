import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import { getAsignacionById } from "../../../api/AsignacionAPI";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { finalizarFotos, uploadImage } from "../../../api/ChecklistAPI";
import { CONFIG_ASIGNACION } from "../../../types/imageUpload";
import { toast } from "react-toastify";
import ImageUploadGrid from "../../../components/admin/image/ImageUploadGrid";

export default function ChecklistImageUploadView() {

    const { asignacionId, checklistId } = useParams();
    const navigate = useNavigate();
    
    const { data, isLoading } = useQuery({
        queryKey: ['Asignacion', +asignacionId!],
        queryFn: () => getAsignacionById(+asignacionId!)
    });

    const { imageUrls, uploadedFields, uploadingFields, isAnyUploading, canFinalize, handleUpload } = useImageUpload({
        imagenesExistentes: data?.checklist?.imagenes,
        uploadFn: ({ file, fieldId }) => uploadImage({ file, asignacionId: +asignacionId!, checklistId: +checklistId!, fieldId }),
        obligatorias: CONFIG_ASIGNACION.obligatorias,
        conFirma: true,
    });

    const { mutate: finalizar, isPending } = useMutation({
        mutationFn: finalizarFotos,
        onSuccess: () => {
            toast.success('Asignación Finalizada Correctamente');
            navigate('/?page=1');
        }
    });

    if(isLoading) return <p className="text-center py-20 text-gray-500">Cargando datos...</p>;

    return (
        <div>
            <div className=" mb-6 px-4 pt-6">
                <h1 className=" text-2xl font-semibold text-gray-900">Paso 3: Fotografías y Firma</h1>
                <p className="text-sm text-gray-500 mt-0.5">Gestiona las imágenes obligatorias y ocpionales del checklist</p>
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
                onFinalizar={() => finalizar({ asignacionId: +asignacionId!, checklistId: +checklistId! })}
                labelFinalizar="Finalizar asignación"
            />
        </div>
    )
}
