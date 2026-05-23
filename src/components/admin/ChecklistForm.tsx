import { useEffect, useState } from "react";
import { RespuestaItem } from "../../api/ChecklistAPI";
import { PreguntaConRespuesta } from "../../types";

type Seccion = {
    nombre: string;
    preguntas: PreguntaConRespuesta[];
};
 
type ChecklistFormProps = {
    seccion: Seccion;
    seccionActual: number;
    totalSecciones: number;
    isGuardando: boolean;
    estaCompleto: boolean;
    onAnterior: () => void;
    onSiguiente: (respuestas: RespuestaItem[]) => void;
    onFinalizar: (respuestas: RespuestaItem[]) => void;
};

export default function ChecklistForm({ seccion, seccionActual, totalSecciones, isGuardando, estaCompleto, onAnterior, onSiguiente, onFinalizar}: ChecklistFormProps) {

  const [valores, setValores] = useState<Record<number, string>>({});
  const [errores, setErrores] = useState<Record<number, string>>({});

  useEffect(() => {
    const iniciales: Record<number, string> = [];
    seccion.preguntas.forEach(p => {
      iniciales[p.preguntaId] = p.valor ?? '';
    });
    setValores(iniciales);
    setErrores({});
    setErrores({});
  }, [seccion]);

  const handleChange = (preguntaId: number, valor: string) => {
    setValores(prev => ({ ...prev, [preguntaId]: valor }));
    if(errores[preguntaId]) {
      setErrores(prev => { const e = { ...prev }; delete e[preguntaId]; return e; });
    }
  };

  const validar = (): boolean => {
    const nuevosErrores: Record<number, string> = {};

    seccion.preguntas.forEach(p => {
      if (!p.obligatorio) return;
      const val = valores[p.preguntaId] ?? '';

      if (val === '' || val === null) {
          nuevosErrores[p.preguntaId] = 'Este campo es obligatorio';
          return;
      }
      if (p.tipo === 'numero' && isNaN(Number(val))) {
          nuevosErrores[p.preguntaId] = 'Debe ser un número';
      }
      if (p.tipo === 'si_no' && !['si', 'no'].includes(val)) {
          nuevosErrores[p.preguntaId] = "Selecciona 'Sí' o 'No'";
      }
      if (p.tipo === 'opciones' && !['BUENO', 'REGULAR', 'MALO'].includes(val)) {
          nuevosErrores[p.preguntaId] = 'Selecciona una opción';
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
 
    const getRespuestas = (): RespuestaItem[] =>
        seccion.preguntas.map(p => ({
            preguntaId: p.preguntaId,
            valor: valores[p.preguntaId] ?? '',
        }));
 
    const handleSiguiente = () => {
        if (!validar()) return;
        onSiguiente(getRespuestas());
    };
 
    const handleFinalizar = () => {
        if (!validar()) return;
        onFinalizar(getRespuestas());
    };
 
    const esUltima = seccionActual === totalSecciones - 1;

  return (
    <div className=" bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className=" px-6 py-4 border-b border-gray-100">
        <h2 className=" text-base font-semibold text-gray-900">{seccion.nombre}</h2>
        <p className=" text-xs text-gray-400 mt-0.5">{seccion.preguntas.length} preguntas</p>
      </div>
      <div className=" px-6 py-5 space-y-5">
        {seccion.preguntas.map(pregunta => (
          <div key={pregunta.preguntaId}>
            <label className=" block text-sm font-medium text-gray-700 mb-1.5">
              {pregunta.texto}
              {pregunta.obligatorio && (
                <span className=" text-red-500 ml-1">*</span>
              )}
            </label>

            {pregunta.tipo === 'numero' && (
              <input 
                type="number"
                value={valores[pregunta.preguntaId] ?? ''}
                onChange={e => handleChange(pregunta.preguntaId, e.target.value)}
                className={` w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
                  errores[pregunta.preguntaId]
                    ? 'border-red-300 focus:border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-[#0f1f3d]'
                }`}
                placeholder="Ingresa un número"
              />
            )}

            {pregunta.tipo === 'si_no' && (
              <div className=" flex gap-3">
                {['si', 'no'].map(opcion => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => handleChange(pregunta.preguntaId, opcion)}
                    className={` flex-1 py-2 px-4 text-sm font-medium rounded-lg border  transition-colors ${
                      valores[pregunta.preguntaId] === opcion
                        ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]'
                        : ' bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opcion === 'si' ? 'Sí' : 'No'}
                  </button>
                ))}

                
              </div>
            )}

            {pregunta.tipo === 'opciones' && (
              <div className="flex gap-3">
                {[
                  { valor: 'BUENO',   label: 'Bueno',   color: 'text-green-700 border-green-200 bg-green-50', active: 'bg-green-600 text-white border-green-600' },
                  { valor: 'REGULAR', label: 'Regular', color: 'text-yellow-700 border-yellow-200 bg-yellow-50', active: 'bg-yellow-500 text-white border-yellow-500' },
                  { valor: 'MALO',    label: 'Malo',    color: 'text-red-700 border-red-200 bg-red-50', active: 'bg-red-600 text-white border-red-600' },
                ].map(opcion => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => handleChange(pregunta.preguntaId, opcion.valor)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                      valores[pregunta.preguntaId] === opcion.valor 
                        ? opcion.active
                        : opcion.color
                      
                    }`}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>
            )}

            {pregunta.tipo === 'texto' && (
              <textarea 
                value={valores[pregunta.preguntaId] ?? ''}
                onChange={e => handleChange(pregunta.preguntaId, e.target.value)}
                rows={3}
                placeholder="Comentarios opcionales..."
                className=" w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0f1f3d] transition-colors resize-none"
              />
            )}

            {errores[pregunta.preguntaId] && (
              <p className="mt-1 text-xs text-red-500">{errores[pregunta.preguntaId]}</p>
            )}
            
          </div>
        ))}
      </div>

      {/* Navegación */}
      <div className=" px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAnterior}
          disabled={seccionActual === 0 || isGuardando}
          className=" flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        {!esUltima ? (
          <button
            type="button"
            onClick={handleSiguiente}
            disabled={isGuardando}
            className="flex items-center gap-2 text-sm text-white bg-[#0f1f3d] rounded-lg px-4 py-2 hover:bg-[#1a3a6b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGuardando ? 'Guardando...' : 'Siguiente'}
            {!isGuardando && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalizar}
            disabled={isGuardando || estaCompleto}
            className="flex items-center gap-2 text-sm text-white bg-green-600 rounded-lg px-5 py-2 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isGuardando ? 'Finalizando...' : estaCompleto ? 'Ya finalizado' : 'Finalizar Checklist'}
            {!isGuardando && !estaCompleto && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
