import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query"; 
import { UserRegistrationForm } from "../../types";
import { createAccount } from "../../api/AuthAPI";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import UserForm from "../../components/auth/UserForm";

export default function RegisterView() {
  
  const initialValues: UserRegistrationForm = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    password_confirmation: '',
  }

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserRegistrationForm>({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: createAccount,
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      toast.success(data)
      reset()
    }
  }) 

  const password = watch('password');

  const handleRegister = (formData: UserRegistrationForm) => {
    mutate(formData)
  }

  return (
    <>
      <h1 className=" text-3xl font-bold">Registrar Usuario</h1>
      <p className=" text-xl font-light text-gray-500 mt-5">
        Llena el formulario para el registro de un usuario
      </p>
      <nav className=" my-5">
        <Link
          className=" bg-blue-800 hover:bg-blue-900 rounded-md px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
          to={"/users"}
        >
          Volver
        </Link>
      </nav>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="space-y-8 p-10  bg-white mt-10"
        noValidate
      >
        <UserForm 
          register={register}
          errors= {errors}
          password={password}
        />

        <input
          type="submit"
          value='Registrar Usuario'
          className="bg-blue-900 hover:bg-blue-950 w-full p-3  text-white font-black  text-xl cursor-pointer"
          disabled={isPending}
        />
      </form>
    </>
  )
}