import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import googleIcon from "@/assets/google_icon.svg";
import { Mail, Lock } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import { useState } from "react";

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

  function registerUser() {
    navigate(`/register`);
  }
  async function handleLogin({ user_email, password }: LoginFormImputs) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user_email,
        password
      );
      const user = userCredential.user;
      alert(`Bem-vindo(a), ${user.displayName}`);
      navigate("/dashboard");
    } catch (error) {
      alert("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  }
  async function googleLogin() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    try {
      const user = userCredential.user;
      navigate("/dashboard");
      alert(`Bem vindo, ${user.displayName}`);
    } catch (error) {
      alert("Erro ao realizar login com o google");
    }
  }

  return (
    <div>
      <span className="flex justify-center my-8 ">Faça login em sua conta</span>
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
        <a className="justify-items-end text-end hover:underline" href="#">
          Esqueceu a senha?
        </a>
        <Button
          isLoading={isLoading}
          type="submit"
          text="Entrar"
          backgroundColor="#34D399"
        />
      </form>
      <div className="justify-center mt-8 flex gap-4 ">
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
        <div className="text-[#C2C2C2]">OR</div>
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
      </div>
      <Button
        text="Entre com o Google"
        icon={googleIcon}
        backgroundColor="#FFFF"
        borderColor="#C2C2C2"
        color="#555555"
        onClick={googleLogin}
      />
      <Button
        onClick={registerUser}
        text="Cadastre-se"
        backgroundColor="#FFFF"
        borderColor="#C2C2C2"
        color="#555555"
      />
    </div>
  );
}
