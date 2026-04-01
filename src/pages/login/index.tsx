import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import Input from "@/components/Input";
import Button from "@/components/Button";
import { auth } from "@/services/firebaseConfig";
import { notify } from "@/utils/notify";

type LoginFormImputs = {
  user_email: string;
  password: string;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const schema = yup.object({
    user_email: yup.string().email("Digite um e-mail valido ").required("*"),
    password: yup.string().required("*").min(6, "Minimo 6 caracteres"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  async function handleLogin({ user_email, password }: LoginFormImputs) {
    setIsLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, user_email, password);
      navigate("/dashboard");
    } catch (error) {
      notify.error("Erro ao fazer login. Verifique suas credenciais");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <span className="flex justify-center my-8">Faça login em sua conta</span>
      <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col">
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
        <Input
          id="password"
          type="password"
          placeholder="Digite sua senha"
          icon={<Lock />}
          labelName="Senha"
          labelId="password"
          {...register("password")}
          errorMessage={errors.password?.message}
        />
        <Link
          className="justify-items-end text-end hover:underline"
          to="/reset-password"
        >
          Esqueceu a senha?
        </Link>
        <Button
          isLoading={isLoading}
          type="submit"
          text="Entrar"
          backgroundColor="#34D399"
        />
      </form>
    </div>
  );
}
