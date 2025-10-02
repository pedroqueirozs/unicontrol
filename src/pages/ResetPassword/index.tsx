import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";

import { Mail } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import * as yup from "yup";

import { auth } from "@/services/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

import { notify } from "@/utils/notify";

interface FormData {
  user_email: string;
}

export function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const schema = yup.object({
    user_email: yup.string().email("Digite um e-mail válido").required("*"),
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const navigate = useNavigate();
  function closeLogin() {
    navigate("/");
  }

  async function handleSendPasswordResetEmail(data: FormData) {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, data.user_email);

      notify.success("Enviado com sucesso! Verifique seu e-mail");
      reset();
      navigate("/");
    } catch (error) {
      notify.error("Erro ao enviar link de recuperação");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center my-8">
      <span className="flex justify-center">Recuperar senha</span>
      <p className="text-text_description text-sm flex justify-center items-center text-center mt-2">
        Digite seu e-mail cadastrado e enviaremos um link para você redefinir
        sua senha.
      </p>
      <form
        onSubmit={handleSubmit(handleSendPasswordResetEmail)}
        className="flex pt-8 flex-col"
      >
        <Input
          id="user_email"
          type="email"
          placeholder="example@gmail.com"
          icon={<Mail />}
          labelName="E-mail"
          labelId="user_email"
          {...register("user_email")}
          errorMessage={errors.user_email?.message}
        />
        <Button
          isLoading={isLoading}
          type="submit"
          text="Enviar link de recuperação"
          color="#FFFF"
        />
      </form>

      <div className="justify-center mt-8 flex gap-4 ">
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
        <div className="text-[#C2C2C2]">OU</div>
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
      </div>
      <Button
        onClick={closeLogin}
        text="Voltar para o login"
        backgroundColor="#FFFF"
        color="#555555"
      />
    </div>
  );
}
