import { FotoField } from "../../../types/imageUpload";

type FotoSlotProps = {
    field: FotoField;
    imageUrl: string | null;
    isUploading: boolean;
    isAnyUploading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => void;
    size: 'lg' | 'sm';
}

export default function FotoSlot({ field, imageUrl, isUploading, isAnyUploading, onChange, size }: FotoSlotProps) {
    const height = size === 'lg' ? 'h-32' : 'h-20';

    return (
        <div className={size === 'lg' ? "bg-white p-3 rounded-xl shadow-sm border border-gray-200" : "relative"}>
            {size === 'lg' && (
                <p className=" text-[10px] font-bold text-gray-400 uppercase mb-2 truncate">{field.label}</p>
            )}
            <div className={`relative ${height} bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden rounded-lg group`}>
                <input 
                    type="file" 
                    accept=".jpeg,.jpg,.png"
                    capture="environment"
                    disabled={isAnyUploading}
                    onChange={e => onChange(e, field.id)}
                    className={`absolute inset-0 opacity-0 z-20 ${isAnyUploading ? ' pointer-events-none' : 'cursor-pointer'}`}
                />
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt={field.label} className=" object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className=" text-white text-[10px]">CAMBIAR</span>
                        </div>
                        {!isUploading && (
                            <div className=" absolute bottom-0 left-0 right-0 bg-emerald-500/80 py-1 flex items-center justify-center gap-1 z-10">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-white text-[9px] font-bold uppercase">Subida</span>
                            </div>
                        )}
                    </>
                ) : (
                    <span className=" text-3xl text-gray-200">+</span>
                )}

                {isUploading && (
                    <div className=" absolute inset-0 bg-white/90 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        SUBIENDO...
                    </div>
                )}
            </div>
        </div>
    )
}
