// hooks/useImageUpload.ts
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FotoField } from '../types/imageUpload';

type UseImageUploadParams = {
    imagenesExistentes?: { fieldId: string; urlImagen: string }[];
    uploadFn: (args: { file: File; fieldId: string }) => Promise<{ message: string; imageUrl: string }>;
    obligatorias: FotoField[];
    conFirma: boolean;
}

export function useImageUpload({ imagenesExistentes, uploadFn, obligatorias, conFirma }: UseImageUploadParams) {
    const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
    const [uploadedFields, setUploadedFields] = useState<Record<string, boolean>>({});
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!imagenesExistentes) return;
        const urls: Record<string, string> = {};
        const uploaded: Record<string, boolean> = {};
        imagenesExistentes.forEach(img => {
            urls[img.fieldId] = img.urlImagen;
            uploaded[img.fieldId] = true;
        });
        setImageUrls(urls);
        setUploadedFields(uploaded);
    }, [imagenesExistentes]);

    const { mutate: upload } = useMutation({ mutationFn: uploadFn });

    const handleUpload = (file: File, fieldId: string) => {
        if (uploadingFields[fieldId]) return;
        setUploadingFields(prev => ({ ...prev, [fieldId]: true }));

        const reader = new FileReader();
        upload(
            { file, fieldId },
            {
                onSuccess: (data) => {
                    reader.onloadend = () => {
                        setImageUrls(prev => ({ ...prev, [fieldId]: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                    setUploadedFields(prev => ({ ...prev, [fieldId]: true }));
                    toast.success(data.message || `Imagen subida`);
                },
                onError: (error: any) => {
                    setImageUrls(prev => ({ ...prev, [fieldId]: null }));
                    setUploadedFields(prev => ({ ...prev, [fieldId]: false }));
                    toast.error(error.message || 'Error al subir la imagen');
                },
                onSettled: () => {
                    setUploadingFields(prev => ({ ...prev, [fieldId]: false }));
                }
            }
        );
    };

    const isAnyUploading = Object.values(uploadingFields).some(Boolean);
    const camposObligatorios = conFirma
        ? [...obligatorias.map(f => f.id), 'firma']
        : obligatorias.map(f => f.id);
    const canFinalize = camposObligatorios.every(id => uploadedFields[id]);

    return {
        imageUrls,
        uploadedFields,
        uploadingFields,
        isAnyUploading,
        canFinalize,
        handleUpload,
    };
}