import { useState, useEffect, useRef } from "react";
import { ImagenChecklist } from "../../types/recorrido";

interface ImageLightboxModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: ImagenChecklist[];
    initialIndex?: number;
}

export default function ImageLightboxModal({
    isOpen,
    onClose,
    images,
    initialIndex = 0
}: ImageLightboxModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    // Touch swipe para móviles
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Sincronizar índice inicial cuando se abre
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
        }
    }, [isOpen, initialIndex]);

    // Navegación con teclado (Esc, Flechas)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, images.length]);

    if (!isOpen || images.length === 0) return null;

    const currentImg = images[currentIndex];

    const handleNext = () => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setIsZoomed(false);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Manejadores táctiles móvil
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) handleNext(); // Deslizar izquierda -> siguiente
        if (distance < -minSwipeDistance) handlePrev(); // Deslizar derecha -> anterior

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const toggleZoom = () => setIsZoomed(!isZoomed);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none">
            
            {/* Header del Lightbox */}
            <div className="flex items-center justify-between px-4 py-3 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-gray-300">
                        {currentImg.fieldId.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] text-gray-400">
                        {currentIndex + 1} de {images.length}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botón de Zoom */}
                    <button
                        type="button"
                        onClick={toggleZoom}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xs flex items-center gap-1"
                        title={isZoomed ? "Quitar zoom" : "Hacer zoom"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isZoomed ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"} />
                        </svg>
                    </button>

                    {/* Botón Cerrar */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Contenedor Principal de la Imagen (Swipeable) */}
            <div 
                className="relative flex-1 flex items-center justify-center overflow-hidden px-2 sm:px-12 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={toggleZoom}
            >
                <img
                    src={currentImg.urlImagen}
                    alt={`Foto ${currentImg.fieldId}`}
                    className={`max-h-[82vh] max-w-full object-contain transition-transform duration-200 select-none ${
                        isZoomed ? "scale-150 sm:scale-[1.8] cursor-zoom-out" : "scale-100 cursor-zoom-in"
                    }`}
                />

                {/* Flecha Izquierda (PC/Tablet) */}
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="hidden sm:flex absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors items-center justify-center"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Flecha Derecha (PC/Tablet) */}
                {images.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="hidden sm:flex absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors items-center justify-center"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Tira inferior de miniaturas (thumbnails) */}
            <div className="px-4 py-3 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto flex items-center justify-center gap-2">
                {images.map((img, idx) => (
                    <button
                        key={img.id}
                        type="button"
                        onClick={() => { setCurrentIndex(idx); setIsZoomed(false); }}
                        className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                            idx === currentIndex 
                                ? "border-white scale-105 shadow-md" 
                                : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                    >
                        <img 
                            src={img.urlImagen} 
                            alt={img.fieldId} 
                            className="w-full h-full object-cover" 
                        />
                    </button>
                ))}
            </div>

        </div>
    );
}