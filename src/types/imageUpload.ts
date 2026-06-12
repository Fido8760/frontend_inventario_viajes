export type FotoField = {
    id: string;
    label: string;
}

export type ImageUploadConfig = {
    obligatorias: FotoField[];
    opcionales: FotoField[];
    conFirma: boolean;
}

export const CONFIG_ASIGNACION: ImageUploadConfig = {
    obligatorias: [
        { id: 'frontal',          label: 'Foto Frontal' },
        { id: 'lateral_derecho',  label: 'Lateral Derecha' },
        { id: 'lateral_izquierdo',label: 'Lateral Izquierda' },
        { id: 'trasera',          label: 'Foto Trasera' },
        { id: 'interior_cabina',  label: 'Interior Cabina' },
        { id: 'documentacion',    label: 'Documentación' },
        { id: 'odometro',         label: 'Odómetro (Foto)' },
    ],
    opcionales: Array.from({ length: 16 }, (_, i) => ({
        id: `opcional_${i + 1}`, label: `Opcional ${i + 1}`
    })),
    conFirma: true
}

export const CONFIG_INSPECCION_UNIDAD: ImageUploadConfig = {
    obligatorias: [
        { id: 'frontal',          label: 'Foto Frontal' },
        { id: 'lateral_derecho',  label: 'Lateral Derecha' },
        { id: 'lateral_izquierdo',label: 'Lateral Izquierda' },
        { id: 'trasera',          label: 'Foto Trasera' },
        { id: 'interior_cabina',  label: 'Interior Cabina' },
        { id: 'documentacion',    label: 'Documentación' },
        { id: 'odometro',         label: 'Odómetro (Foto)' },
        { id: 'motor',            label: 'Motor' },
    ],
    opcionales: Array.from({ length: 8 }, (_, i) => ({
        id: `opcional_${i + 1}`, label: `Opcional ${i + 1}`
    })),
    conFirma: false
}

export const CONFIG_INSPECCION_REMOLQUE: ImageUploadConfig = {
    obligatorias: [
        { id: 'frontal',          label: 'Foto Delantera' },
        { id: 'trasera',          label: 'Foto Trasera' },
        { id: 'lateral_derecho',  label: 'Costado Derecho' },
        { id: 'lateral_izquierdo',label: 'Costado Izquierdo' },
    ],
    opcionales: Array.from({ length: 8 }, (_, i) => ({
        id: `opcional_${i + 1}`, label: `Opcional ${i + 1}`
    })),
    conFirma: false
}