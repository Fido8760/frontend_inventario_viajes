import { jsPDF } from 'jspdf';
import autoTable, { Styles, FontStyle } from 'jspdf-autotable';
import { AsignacionByIdApiResponse, PreguntaRespuesta } from '../types';
import plantillaCompleta from '../views/admin/checklist/preguntas.json';

// 1. Definir tipos para los estilos
interface PdfTableStyles extends Partial<Styles> {
    fillColor?: [number, number, number] | string;
    textColor?: number;
    fontStyle?: FontStyle;
}

// 2. Configuración de estilos con tipos correctos
const PDFStyles = {
    title: { 
        fontSize: 18, 
        color: [41, 128, 185] as [number, number, number] 
    },
    subtitle: { 
        fontSize: 14, 
        color: [44, 62, 80] as [number, number, number] 
    },
    header: {
        fillColor: [41, 128, 185] as [number, number, number],
        textColor: 255,
        fontStyle: 'bold' as FontStyle
    },
    sectionHeader: {
        fillColor: [230, 230, 230] as [number, number, number],
        textColor: 0,
        fontStyle: 'bold' as FontStyle
    }
};

interface ExportPdfOptions {
    fileName?: string;
    includeImages?: boolean;
    includeLogo?: boolean;
}
const addLogoToPdf = async (doc: jsPDF): Promise<void> => {
    try {
        // Usa la misma ruta que tu componente Logo
        const logoUrl = '/AMADO_LOGO.png'; // Asegúrate que esta ruta es correcta
        const imgData = await loadImage(logoUrl);
        
        // Configuración del logo (ajusta según necesites)
        const logoWidth = 40;
        const logoHeight = 20;
        const logoX = doc.internal.pageSize.width - logoWidth - 15; // Derecha con margen
        const logoY = 10; // Margen superior
        
        doc.addImage(imgData, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
        // Puedes agregar un toast de error aquí si lo deseas
    }
};
// 3. Función principal para exportar a PDF
export const exportChecklistToPdf = async (
    data: AsignacionByIdApiResponse,
    options: ExportPdfOptions = {}
): Promise<void> => {
    const doc = new jsPDF();
    const fecha = new Date(data.createdAt).toLocaleDateString();
    const ultimoChecklist = data.checklist;
    const respuestasGuardadas = ultimoChecklist?.respuestas;
    const imagenes = ultimoChecklist?.imagenes;
    const tipoUnidadActual = data.unidad?.tipo_unidad;

    if (options.includeLogo) {
        await addLogoToPdf(doc);
    }

    // Crear mapa de respuestas
    const respuestasMap = createRespuestasMap(respuestasGuardadas);

    // Configuración inicial
    const fileName = options.fileName || `Checklist_${data.unidad?.no_unidad || 'asignacion'}_${fecha.replace(/\//g, '-')}.pdf`;

    // --- Encabezado ---
    doc.setFontSize(PDFStyles.title.fontSize);
    doc.setTextColor(...PDFStyles.title.color);
    
    // Ajustar posición Y inicial según si hay logo
    let yPosition = options.includeLogo ? 35 : 20;
    
    doc.text(`Checklist Unidad ${data.unidad?.no_unidad || 'N/A'}`, 14, yPosition);
    yPosition += 10;

    // Información básica
    doc.setFontSize(PDFStyles.subtitle.fontSize);
    doc.setTextColor(...PDFStyles.subtitle.color);
    
    doc.text(`Operador: ${data.operador?.nombre || 'N/A'} ${data.operador?.apellido_p || ''}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Placas: ${data.unidad?.u_placas || 'N/A'}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Tipo: ${tipoUnidadActual || 'N/A'}`, 14, yPosition);
    yPosition += 7;
    doc.text(`Fecha: ${fecha}`, 14, yPosition);
    yPosition += 15;

    // --- Tabla de información general ---
    const generalInfoData = [
        ['Usuario', data.usuario?.name || 'N/A'],
        ['Caja', data.caja ? `${data.caja.c_placas} - ${data.caja.c_marca}` : 'N/A'],
        ['Vigencia Licencia', data.operador?.vigencia_lic || 'N/A'],
        ['Vigencia Apto Médico', data.operador?.vigencia_apto || 'N/A']
    ];

    autoTable(doc, {
        startY: yPosition,
        head: [['Campo', 'Valor']],
        body: generalInfoData,
        styles: getTableStyles(),
        headStyles: PDFStyles.header as Styles,
        margin: { left: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // --- Checklist ---
    if (plantillaCompleta?.preguntas && Array.isArray(plantillaCompleta.preguntas)) {
        for (const seccionPlantilla of plantillaCompleta.preguntas) {
        const preguntasRelevantes = seccionPlantilla.preguntas?.filter(pPlantilla => 
            !pPlantilla.aplicaA || 
            pPlantilla.aplicaA.toLowerCase() === 'todos' || 
            pPlantilla.aplicaA.toLowerCase() === tipoUnidadActual?.toLowerCase()
        ) || [];

        if (preguntasRelevantes.length === 0) continue;

        // Sección del checklist
        doc.setFontSize(14);
        doc.setTextColor(...PDFStyles.title.color);
        doc.text(seccionPlantilla.nombre, 14, yPosition);
        yPosition += 8;

        // Tabla de preguntas/respuestas
        const tableData = preguntasRelevantes.map(preguntaPlantilla => {
            const respuestaGuardada = respuestasMap.get(preguntaPlantilla.idPregunta);
            return [
            preguntaPlantilla.pregunta,
            formatPdfAnswer(respuestaGuardada, preguntaPlantilla.tipo)
            ];
        });

        autoTable(doc, {
            startY: yPosition,
            head: [['Pregunta', 'Respuesta']],
            body: tableData,
            styles: getTableStyles(),
            headStyles: PDFStyles.sectionHeader as Styles,
            columnStyles: {
            0: { fontStyle: 'bold' as FontStyle },
            1: { halign: 'left' as const }
            },
            margin: { left: 14 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
    }

    // --- Imágenes ---
    if (options.includeImages && imagenes?.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(...PDFStyles.title.color);
        doc.text('Imágenes Adjuntas', 14, 20);
        
        let imageY = 30;
        const imageWidth = 160;
        const imageHeight = 120;
        
        for (const imagen of imagenes) {
        try {
            const imgData = await loadImage(imagen.urlImagen);
            doc.addImage(imgData, 'JPEG', 25, imageY, imageWidth, imageHeight);
            imageY += imageHeight + 10;
            
            if (imageY + imageHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            imageY = 20;
            }
        } catch (error) {
            console.error('Error al cargar imagen:', error);
        }
        }
    }

    // Guardar el PDF
    doc.save(fileName);
};

// --- Funciones auxiliares ---

// 4. Función para crear mapa de respuestas
const createRespuestasMap = (respuestasGuardadas: any): Map<number, PreguntaRespuesta> => {
    const map = new Map<number, PreguntaRespuesta>();
    if (respuestasGuardadas?.secciones) {
        for (const seccion of respuestasGuardadas.secciones) {
        if (seccion.preguntas) {
            for (const pregRespuesta of seccion.preguntas) {
            if (typeof pregRespuesta.idPregunta === 'number') {
                map.set(pregRespuesta.idPregunta, pregRespuesta);
            }
            }
        }
        }
    }
    return map;
};

// 5. Función para formatear respuestas
const formatPdfAnswer = (respuesta: PreguntaRespuesta | undefined, tipo: string): string => {
  if (!respuesta?.respuesta) return 'N/A';
  
  switch (tipo) {
    case 'si_no':
      return respuesta.respuesta === 'si' ? 'Sí' : 'No';
    case 'opciones':
      return String(respuesta.respuesta).charAt(0).toUpperCase() + 
             String(respuesta.respuesta).slice(1).toLowerCase();
    case 'numero':
      return `${respuesta.respuesta} km`;
    case 'texto':
      return `"${respuesta.respuesta}"`;
    default:
      return String(respuesta.respuesta);
  }
};

// 6. Función para cargar imágenes
const loadImage = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

// 7. Función helper para estilos de tabla
const getTableStyles = (): PdfTableStyles => ({
    cellPadding: 4,
    fontSize: 10,
    halign: 'left',
    valign: 'middle',
    fontStyle: 'normal'
});