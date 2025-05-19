import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import googleIcon from "../../../public/images/google_icon.svg";

import Input from "../../components/Input";
import Button from "../../components/Button";
/* import AuthLayout from "../../components/layouts/AuthLayout"; */

import { useNavigate } from "react-router-dom";

import { Mail, Lock } from "lucide-react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../services/firebaseConfig";

export default function Login() {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleLogin({ user_email, password }: any) {
    console.log("Antes da função de login ser chamada!");
    await signInWithEmailAndPassword(auth, user_email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate("/dashboard");
        alert(`Bem-vindo(a), ${user.email}`);
      })
      .catch((error) => {
        console.log(error);
        alert("Erro ao fazer login. Verifique suas credenciais.");
      });
  }
  async function googleLogin() {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        alert(`Bem vindo, ${user.displayName}`);
      })
      .catch((error) => {
        console.log("Erro ao realizar o ligin com o google", error);
      });
  }

  return (
    <div>
      <span className="flex justify-center my-8 ">Login into your account</span>
      <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col">
        <Input
          id="user_email"
          type="email"
          placeholder="example@gmail.com"
          icon={<Mail />}
          labelName="Email address"
          labelId="user_email"
          {...register("user_email")}
          errorsSpan={errors.user_email?.message}
        />
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock />}
          labelName="Password"
          labelId="password"
          {...register("password")}
          errorsSpan={errors.password?.message}
        />
        <a className="justify-items-end text-end  text-color_tertiary" href="#">
          Forgot password?
        </a>
        <Button type="submit" text="Login now" backgroundColor="#F39C12" />
      </form>
      <div className="justify-center mt-8 flex gap-4 ">
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
        <div className="text-[#C2C2C2]">OR</div>
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
      </div>
      <Button
        text="Login with Google"
        icon={googleIcon}
        backgroundColor="#FFFF"
        borderColor="#C2C2C2"
        color="#555555"
        onClick={googleLogin}
      />
      <Button
        onClick={registerUser}
        text="Signup now"
        backgroundColor="#FFFF"
        borderColor="#C2C2C2"
        color="#555555"
      />
    </div>
  );
}
