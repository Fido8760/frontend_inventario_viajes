import { jsPDF } from 'jspdf';
import autoTable, { Styles, FontStyle } from 'jspdf-autotable';
import { InspeccionById, RespuestaInspeccion } from '../types';

const PDFStyles = {
    title: {
        fontSize: 18,
        color: [15, 31, 61] as [number, number, number]
    },
    subtitle: {
        fontSize: 11,
        color: [80, 80, 80] as [number, number, number]
    },
    header: {
        fillColor: [15, 31, 61] as [number, number, number],
        textColor: 255,
        fontStyle: 'bold' as FontStyle
    },
    sectionHeader: {
        fillColor: [232, 237, 245] as [number, number, number],
        textColor: 0,
        fontStyle: 'bold' as FontStyle
    }
};

interface ExportPdfOptions {
    fileName?: string;
    includeImages?: boolean;
    includeLogo?: boolean;
}

const loadImage = async (url: string): Promise<{ data: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject('No context'); return; }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve({ data: canvas.toDataURL('image/jpeg', 0.92), width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = url;
    });
};

const addLogoToPdf = async (doc: jsPDF): Promise<void> => {
    try {
        const logo = await loadImage('/AMADO_LOGO.png');
        const logoWidth = 30;
        const logoHeight = 15;
        const logoX = doc.internal.pageSize.width - logoWidth - 14;
        doc.addImage(logo.data, 'JPEG', logoX, 10, logoWidth, logoHeight);
    } catch (error) {
        console.warn(error);
    }
};

const addFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
};

const formatValor = (item: RespuestaInspeccion): string => {
    const val = item.valor;
    const tipo = item.pregunta?.tipo;
    if (!val || val === '') return 'Sin respuesta';
    switch (tipo) {
        case 'si_no': return val === 'si' ? 'Sí' : 'No';
        case 'opciones': return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        case 'numero': return `${val} km`;
        case 'texto': return val;
        default: return val;
    }
};

const getTableStyles = (): Partial<Styles> => ({
    cellPadding: 4,
    fontSize: 10,
    halign: 'left',
    valign: 'middle',
    fontStyle: 'normal'
});

export const exportInspeccionToPdf = async (
    data: InspeccionById,
    options: ExportPdfOptions = {}
): Promise<void> => {
    const doc = new jsPDF();
    const fecha = new Date(data.createdAt).toLocaleDateString('es-MX');
    const esRemolque = data.tipo === 'REMOLQUE';
    const imagenes = data.imagenes ?? [];
    const respuestas = data.respuestas ?? [];

    if (options.includeLogo) await addLogoToPdf(doc);

    let y = options.includeLogo ? 38 : 20;

    // ── Header ───────────────────────────────────────────────────────────────
    const titulo = esRemolque
        ? `Inspección Remolque ${data.caja?.numero_caja ?? 'N/A'}`
        : `Inspección Unidad ${data.unidad?.no_unidad ?? 'N/A'}`;

    doc.setFontSize(PDFStyles.title.fontSize);
    doc.setTextColor(...PDFStyles.title.color);
    doc.text(titulo, 14, y);
    y += 10;

    doc.setFontSize(PDFStyles.subtitle.fontSize);
    doc.setTextColor(...PDFStyles.subtitle.color);

    if (esRemolque) {
        doc.text(`Caja: ${data.caja?.numero_caja ?? 'N/A'} | Placas: ${data.caja?.c_placas ?? 'N/A'} | Marca: ${data.caja?.c_marca ?? 'N/A'}`, 14, y);
    } else {
        doc.text(`Unidad: ${data.unidad?.no_unidad ?? 'N/A'} | Placas: ${data.unidad?.u_placas ?? 'N/A'} | Tipo: ${data.unidad?.tipo_unidad ?? 'N/A'}`, 14, y);
    }
    y += 6;

    doc.text(`Registrado por: ${data.usuario?.name ?? ''} ${data.usuario?.lastname ?? ''}`.trim(), 14, y);
    y += 6;
    doc.text(`Fecha: ${fecha}`, 14, y);
    y += 12;

    // ── Info general ─────────────────────────────────────────────────────────
    autoTable(doc, {
        startY: y,
        head: [['Campo', 'Valor']],
        body: [
            ['Tipo de inspección', esRemolque ? 'Remolque' : 'Unidad'],
            ['Estado', data.status === 'COMPLETA' ? 'Completa' : data.status === 'FOTOS_PENDIENTES' ? 'Fotos pendientes' : 'En progreso'],
            ['Total respuestas', String(respuestas.length)],
            ['Total fotografías', String(imagenes.length)],
        ],
        styles: getTableStyles(),
        headStyles: PDFStyles.header as Styles,
        bodyStyles: { valign: 'middle' },
        theme: 'grid',
        rowPageBreak: 'avoid',
        margin: { left: 14 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Respuestas por sección ────────────────────────────────────────────────
    const seccionesMap = new Map<string, RespuestaInspeccion[]>();
    const ordenadas = [...respuestas].sort((a, b) => (a.pregunta?.orden ?? 0) - (b.pregunta?.orden ?? 0));

    for (const r of ordenadas) {
        const seccion = r.pregunta?.seccion ?? 'General';
        if (!seccionesMap.has(seccion)) seccionesMap.set(seccion, []);
        seccionesMap.get(seccion)!.push(r);
    }

    for (const [nombre, items] of seccionesMap.entries()) {
        doc.setFontSize(12);
        doc.setTextColor(...PDFStyles.title.color);
        doc.text(nombre, 14, y);
        y += 6;

        autoTable(doc, {
            startY: y,
            head: [['Pregunta', 'Respuesta']],
            body: items.map(item => [item.pregunta?.texto ?? '', formatValor(item)]),
            styles: getTableStyles(),
            headStyles: PDFStyles.sectionHeader as Styles,
            bodyStyles: { valign: 'middle' },
            theme: 'grid',
            rowPageBreak: 'avoid',
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 120 },
                1: { halign: 'left' }
            },
            margin: { left: 14 }
        });

        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Imágenes ──────────────────────────────────────────────────────────────
    if (options.includeImages && imagenes.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(...PDFStyles.title.color);
        doc.text('Evidencia Fotográfica', 14, 20);

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        const gap = 10;
        const columns = 2;
        const imageWidth = (pageWidth - margin * 2 - gap) / columns;
        const maxImageHeight = 70;

        let x = margin;
        let imageY = 30;
        let col = 0;

        for (const imagen of imagenes) {
            try {
                const img = await loadImage(imagen.urlImagen);
                let renderWidth = imageWidth;
                let renderHeight = (img.height * renderWidth) / img.width;

                if (renderHeight > maxImageHeight) {
                    renderHeight = maxImageHeight;
                    renderWidth = (img.width * renderHeight) / img.height;
                }

                if (imageY + renderHeight + 20 > pageHeight - 20) {
                    doc.addPage();
                    x = margin;
                    imageY = 20;
                    col = 0;
                }

                const offsetX = (imageWidth - renderWidth) / 2;

                doc.setDrawColor(220);
                doc.rect(x + offsetX - 1, imageY - 1, renderWidth + 2, renderHeight + 2);
                doc.addImage(img.data, 'JPEG', x + offsetX, imageY, renderWidth, renderHeight);

                doc.setFontSize(8);
                doc.setTextColor(90);
                doc.text(imagen.fieldId?.replace(/_/g, ' ') ?? '', x, imageY + renderHeight + 5);

                col++;
                if (col >= columns) {
                    col = 0;
                    x = margin;
                    imageY += maxImageHeight + 20;
                } else {
                    x += imageWidth + gap;
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    addFooter(doc);

    // ── Save ──────────────────────────────────────────────────────────────────
    const identificador = esRemolque
        ? `Remolque_${data.caja?.numero_caja ?? 'N/A'}`
        : `Unidad_${data.unidad?.no_unidad ?? 'N/A'}`;

    const fileName = options.fileName ?? `Inspeccion_${identificador}_${fecha.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
};