import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Input from "../../components/Input";
import Button from "../../components/Button";

import { LockKeyhole, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth } from "../../services/firebaseConfig";

export default function Register() {
  const schema = yup.object({
    name: yup.string().required("*"),
    email: yup.string().email("Digite um e-mail valido ").required("*"),
    confirm_email: yup
      .string()
      .required("*")
      .oneOf([yup.ref("email")], "Os emails não são iguais"),
    password: yup.string().required("*").min(6, "Minimo 6 caracteres"),
    confirm_password: yup
      .string()
      .required("*")
      .oneOf([yup.ref("password")], "As senhas devem ser iguais"),
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  function closeLogin() {
    navigate("/");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleRegister({ email, password, name }: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: name,
      });
      console.log("Este são os dados do usuario criado!", user.displayName);
      navigate("/dashboard");
    } catch (error) {
      console.log("Erro ao cadastrar novo usuario", error);
    }
  }

  return (
    <div>
      <span className="flex justify-center my-8 ">Crie sua conta</span>

      <form onSubmit={handleSubmit(handleRegister)} className="flex flex-col">
        <Input
          id="name"
          type="text"
          placeholder="Insira o seu nome"
          icon={<User />}
          labelName="Nome"
          labelId="name"
          {...register("name")}
          errorsSpan={errors.name?.message}
        />

        <Input
          id="user_email"
          type="email"
          placeholder="example@gmail.com"
          icon={<Mail />}
          labelName="E-mail"
          labelId="user_email"
          {...register("email")}
          errorsSpan={errors.email?.message}
        />

        <Input
          id="confirm_email"
          type="email"
          placeholder="example@gmail.com"
          icon={<Mail />}
          labelName="Confirme o seu e-mail"
          labelId="confirm_email"
          {...register("confirm_email")}
          errorsSpan={errors.confirm_email?.message}
        />
        <Input
          id="password"
          type="password"
          placeholder="Crie sua senha"
          icon={<LockKeyhole />}
          labelName="Senha"
          labelId="password"
          {...register("password")}
          errorsSpan={errors.password?.message}
        />
        <Input
          id="confirm_password"
          type="password"
          placeholder="Confirme sua senha"
          icon={<LockKeyhole />}
          labelName="Confirme sua senha"
          labelId="confirm_password"
          {...register("confirm_password")}
          errorsSpan={errors.confirm_password?.message}
        />

        <Button type="onSubmit" text="Cadastrar" backgroundColor="#34D399" />
      </form>
      <div className="justify-center mt-8 flex gap-4 ">
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
        <div className="text-[#C2C2C2]">OR</div>
        <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
      </div>
      <Button
        text="Close"
        onClick={closeLogin}
        backgroundColor="#FFFF"
        color="#34D399"
      />
    </div>
  );
}
