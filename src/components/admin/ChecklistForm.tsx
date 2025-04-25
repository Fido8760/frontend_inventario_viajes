import { FieldErrors, Control } from "react-hook-form";
import { useState } from "react";
import { ChecklistFormData, PreguntaUI, SeccionUI } from "../../types";
import ErrorMessage from "../ui/ErrorMessage";

type ChecklistFormProps = {
  preguntasDataUI: SeccionUI[];
  errors: FieldErrors<ChecklistFormData>;
  control: Control<ChecklistFormData>;
};

type RespuestaPath = `respuestas.preguntas.${number}.respuesta`;
type IdPreguntaPath = `respuestas.preguntas.${number}.idPregunta`;
type TipoPath = `respuestas.preguntas.${number}.tipo`;

export default function ChecklistForm({ control, errors, preguntasDataUI }: ChecklistFormProps) {
  const [pagina, setPagina] = useState(0); // Controla la página actual

  const avanzarPagina = async () => {
    if (pagina < preguntasDataUI.length + 1) {
      setPagina(pagina + 1)
    }
  };

  const retrocederPagina = () => {
    if (pagina > 0) setPagina(pagina - 1);
  };

  const calculateStartIndexForPage = ( pageIndex: number): number => {
    let startIndex = 0
    for(let i = 0; i < pageIndex; i++) {
      startIndex += preguntasDataUI[i].items.length || 0
    }
    return startIndex
  }

  const renderInput = (preguntaUI: PreguntaUI, itemIndexInSection: number) => {

  const globalIndex = calculateStartIndexForPage(pagina) + itemIndexInSection

  const respuestaFieldName: RespuestaPath = `respuestas.preguntas.${globalIndex}.respuesta`;
  const idFieldName: IdPreguntaPath = `respuestas.preguntas.${globalIndex}.idPregunta`;
  const tipoFieldName: TipoPath = `respuestas.preguntas.${globalIndex}.tipo`;
  const fieldError = errors.respuestas?.preguntas?.[globalIndex]?.respuesta

    switch (preguntaUI.tipo) {
      case "numero":
        return (
          <div key={preguntaUI.idPregunta} className="mb-4">
            <label htmlFor={respuestaFieldName} className="block text-sm font-medium text-gray-800 mb-1">
              {preguntaUI.pregunta}
            </label>
            <input
              id={respuestaFieldName}
              type="number"
              // --- USA control.register CON EL NOMBRE ANIDADO ---
              {...control.register(respuestaFieldName, { valueAsNumber: true })} // valueAsNumber es importante
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* Inputs ocultos para idPregunta y tipo */}
            <input type="hidden" {...control.register(idFieldName)} value={preguntaUI.idPregunta} />
            <input type="hidden" {...control.register(tipoFieldName)} value={preguntaUI.tipo} />
            {/* --- ACCESO A ERRORES ANIDADOS --- */}
            {fieldError && <ErrorMessage>{fieldError.message}</ErrorMessage>}
          </div>
        )

      case "si_no":
        return (
          <div key={preguntaUI.idPregunta} className="mb-4">
            <label htmlFor={respuestaFieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {preguntaUI.pregunta}
            </label>
            <select
              id={respuestaFieldName}
              // --- USA control.register CON EL NOMBRE ANIDADO ---
              {...control.register(respuestaFieldName)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              // 'required' HTML no es necesario si Zod maneja la validación
            >
              <option value="">--Seleccione--</option> {/* Permitir valor vacío si es opcional o para estado inicial */}
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
             {/* Inputs ocultos para idPregunta y tipo */}
             <input type="hidden" {...control.register(idFieldName)} value={preguntaUI.idPregunta} />
             <input type="hidden" {...control.register(tipoFieldName)} value={preguntaUI.tipo} />
            {/* --- ACCESO A ERRORES ANIDADOS --- */}
            {fieldError && <ErrorMessage>{fieldError.message}</ErrorMessage>}
          </div>
        )

      case "opciones":
        return (
          <div key={preguntaUI.idPregunta} className="mb-4">
            <label htmlFor={respuestaFieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {preguntaUI.pregunta}
            </label>
            <select
              id={respuestaFieldName}
              // --- USA control.register CON EL NOMBRE ANIDADO ---
              {...control.register(respuestaFieldName)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione...</option> {/* Permitir valor vacío */}
              <option value="BUENO">Bueno</option>
              <option value="REGULAR">Regular</option>
              <option value="MALO">Malo</option>
              {/* Si las opciones fueran dinámicas, vendrían de preguntaUI */}
            </select>
             {/* Inputs ocultos para idPregunta y tipo */}
             <input type="hidden" {...control.register(idFieldName)} value={preguntaUI.idPregunta} />
             <input type="hidden" {...control.register(tipoFieldName)} value={preguntaUI.tipo} />
            {/* --- ACCESO A ERRORES ANIDADOS --- */}
            {fieldError && <ErrorMessage>{fieldError.message}</ErrorMessage>}
          </div>
        )
        
      case "texto":
        return (
          <div key={preguntaUI.idPregunta} className="mb-4">
            <label htmlFor={respuestaFieldName} className="block text-sm font-medium text-gray-700 mb-1">
              {preguntaUI.pregunta}
            </label>
            <textarea
              id={respuestaFieldName}
              // --- USA control.register CON EL NOMBRE ANIDADO ---
              {...control.register(respuestaFieldName)}
              rows={3}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Si tienes comentarios, escríbelos aquí"
            />
             {/* Inputs ocultos para idPregunta y tipo */}
             <input type="hidden" {...control.register(idFieldName)} value={preguntaUI.idPregunta} />
             <input type="hidden" {...control.register(tipoFieldName)} value={preguntaUI.tipo} />
            {/* --- ACCESO A ERRORES ANIDADOS --- */}
            {fieldError && <ErrorMessage>{fieldError.message}</ErrorMessage>}
          </div>
        );
      default:
          // Manejar caso desconocido o devolver null
          const exhaustiveCheck: never = preguntaUI.tipo;
          console.warn(`Tipo de pregunta no manejado: ${exhaustiveCheck}`);
          return null;
    }
  }
  const currentSection = preguntasDataUI[pagina];
  return (
    <div className="mb-6">
      {/* Sección actual basada en la paginación */}
      {currentSection ? (
        <>
          <h2 className="text-xl font-semibold text-indigo-700 border-b pb-2 mb-4">
            {currentSection.seccion}
          </h2>
          {/* Mapea sobre los items de la sección actual */}
          <div className="mt-4">
            {currentSection.items.map((preguntaUI, itemIndex) =>
              // Pasa la pregunta UI y su índice DENTRO de la sección
              renderInput(preguntaUI, itemIndex)
            )}
          </div>
        </>
      ) : (
        <p>No hay preguntas para mostrar en esta página.</p> // Manejo si no hay sección
      )}


      {/* Controles de navegación (se mantienen igual) */}
      <div className="mt-6 flex justify-between">
        {pagina > 0 ? (
          <button
            type="button"
            onClick={retrocederPagina}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Anterior
          </button>
        ) : (
           <div></div> // Placeholder para mantener el espacio si no hay botón "Anterior"
        )}
        {pagina < preguntasDataUI.length - 1 ? (
          <button
            type="button"
            onClick={avanzarPagina} // Llama a la función actualizada (que podría incluir trigger)
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Siguiente
          </button>
        ) : (
             <div></div> // Placeholder para mantener el espacio si no hay botón "Siguiente"
        )}
      </div>
    </div>
  );
}
