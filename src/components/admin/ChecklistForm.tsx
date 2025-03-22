import {  FieldErrors, UseFormRegister } from "react-hook-form"
import { FormValues, Pregunta, Seccion } from "../../types"
import ErrorMessage from "../ui/ErrorMessage";


type ChecklistFormProps = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  preguntas: Seccion[]
};

export default function ChecklistForm({ register,  errors, preguntas }: ChecklistFormProps) {


  const renderInput = (pregunta: Pregunta) => {
    const fieldName = pregunta.idPregunta.toString()
    switch(pregunta.tipo) {
      case 'numero' :
        return (
          <div key={fieldName} className=" mb-4">
            <label 
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-800 mb-1"
            >{pregunta.pregunta}</label>
            <input type="number" 
              {...register(fieldName, { 
                required: 'Coloque el Km del odómetro',
                valueAsNumber: true
              })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

            {errors[fieldName] && <ErrorMessage>{errors[fieldName]?.message as string}</ErrorMessage>}
          </div>
        )
      case 'si_no':
        return (
          <div key={fieldName} className=" mb-4">
            <label 
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700 mb-1"
            >{pregunta.pregunta}</label>
            <select 
              id={fieldName}
              {...register(fieldName)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required 
            >
              <option value="" disabled>--Seleccione--</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
            {errors[fieldName] && (<ErrorMessage>{errors[fieldName]?.message as string}</ErrorMessage>)}
          </div>
        )
      case 'opciones':
        return (
          <div key={fieldName} className="mb-4">
            <label 
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700 mb-1"
            >{pregunta.pregunta}</label>
            <select 
              id={fieldName} 
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register(fieldName)}
              required 
            >
              <option value="" disabled >Seleccione...</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="malo">Malo</option>
            </select>
            {errors[fieldName] && (<ErrorMessage>{errors[fieldName]?.message as string}</ErrorMessage>)}
          </div>
        )
        case 'texto':
          return (
            <div key={fieldName} className="mb-4">
              <label
                htmlFor={fieldName}
                className="block text-sm font-medium text-gray-700 mb-1"
              >{pregunta.pregunta}</label>
              <textarea 
                {...register(fieldName)} 
                rows={3}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Si tienes comentarios, escríbelos aquí"
              />
              {errors[fieldName] && (<ErrorMessage>{errors[fieldName]?.message as string}</ErrorMessage>)}
            </div>
          );
      }
  }

  return (
    <>
      <div >
        {preguntas.map( seccion => (
          <div key={seccion.seccion} >
            <h2 className="text-lg font-semibold text-indigo-700 border-b pb-2">{seccion.seccion}</h2>
            <div className="mt-4">
              {seccion.items.map( pregunta => renderInput(pregunta))}
            </div>

          </div>
        ))}
      </div>
    </>
  )
}
