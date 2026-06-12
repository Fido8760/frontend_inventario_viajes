import React from "react";
import { ImageUploadConfig } from "../../../types/imageUpload";
import FotoSlot from "./FotoSlot";
import SignaturePad from "../SignaturePad";

type ImageUploadGridsProps = {
    config: ImageUploadConfig;
    imageUrls: Record<string, string | null>;
    uploadedFields: Record<string, boolean>;
    uploadingFields: Record<string, boolean>;
    isAnyUploading: boolean;
    canFinalize: boolean;
    isPending: boolean;
    onFileChange: (file: File, fieldId: string) => void;
    onSaveSignature?: (file: File) => void;
    onFinalizar: () => void;
    labelFinalizar?: string;
}

export default function ImageUploadGrid({ config, imageUrls, uploadedFields, uploadingFields, isAnyUploading, canFinalize, isPending, onFileChange, onSaveSignature, onFinalizar, labelFinalizar }:ImageUploadGridsProps) {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileChange(file, fieldId);
    };
    
    return (
        <div className=" max-w-6xl mx-auto pb-24 px-4">
            <h2 className=" text-sm font-bold mt-10 text-gray-700 uppercase tracking-wider">
                Fotografías Obligatorias
            </h2>
            <p className=" text-xs text-gray-500 mb-2">Presiona para agregar una imagen o tomar una foto</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {config.obligatorias.map(f => (
                    <FotoSlot 
                        key={f.id}
                        field={f}
                        imageUrl={imageUrls[f.id] ?? null}
                        isUploading={!!uploadingFields[f.id]}
                        isAnyUploading={isAnyUploading}
                        onChange={handleChange}
                        size="lg"
                    />
                ))}
            </div>

             <h2 className="text-sm font-bold mt-12 text-gray-700 uppercase tracking-wider opacity-50">
                Fotografías Opcionales
            </h2>
            <p className="text-xs text-gray-500 mb-2">Presiona para agregar una imagen o tomar una foto</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {config.opcionales.map(f => (
                    <FotoSlot
                        key={f.id}
                        field={f}
                        imageUrl={imageUrls[f.id] ?? null}
                        isUploading={!!uploadingFields[f.id]}
                        isAnyUploading={isAnyUploading}
                        onChange={handleChange}
                        size="sm"
                    />
                ))}
            </div>
            {config.conFirma && onSaveSignature && (
                <div className=" mt-16 border-t border-gray-200 pt-10">
                    <div className="max-w-lg mx-auto">
                        <h2 className=" text-base font-semibold text-gray-900 text-center mb-1">Firma del Operador</h2>
                        <p className=" text-xs text-gray-400 text-center mb-6">El operador debe firmar para confirmar el checklist</p>
                        <div className=" bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative">
                            {!uploadedFields['firma'] ? (
                                <>
                                    <SignaturePad onSave={onSaveSignature} />
                                    {uploadingFields['firma'] && (
                                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-xs font-bold text-blue-600">SUBIENDO FIRMA...</div>
                                    )}
                                </>
                            ) : (
                                <div className=" p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">✓ Firma capturada</p>
                                    {imageUrls['firma'] && (
                                        <img src={imageUrls['firma']} alt="Firma" className="h-20 mx-auto object-contain" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {canFinalize && (
                <div className="mt-16 flex justify-center pb-10">
                    <button
                        onClick={onFinalizar}
                        disabled={isPending}
                        className="w-full md:w-96 bg-[#0f1f3d] hover:bg-[#13284d] text-white font-semibold py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Finalizando...' : labelFinalizar}
                    </button>
                </div>
            )}
        </div>
    )
}
