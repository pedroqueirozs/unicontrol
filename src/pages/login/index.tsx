import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import emailIcon from "../../../public/images/email_icon.svg";
import passwordIcon from "../../../public/images/password_icon.svg";
import googleIcon from "../../../public/images/google_icon.svg";

import Input from "../../components/Input";
import Button from "../../components/Button";
import Header from "../../components/Header";

import { useNavigate } from "react-router-dom";
import { SetStateAction, useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log(email, password);

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
  function loginNow() {
    navigate(`/home`);
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-text_description">
      <Header page="Login" />
      <div>
        <form
          onSubmit={handleSubmit(loginNow)}
          className="flex flex-col"
          action=""
        >
          <Input
            id="user_email"
            type="email"
            placeholder="example@gmail.com"
            icon={emailIcon}
            className="input"
            labelName="Email address"
            labelId="user_email"
            {...register("user_email")}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setEmail(e.target.value)
            }
          />
          <span style={{ color: "red " }}>{errors.user_email?.message}</span>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            icon={passwordIcon}
            className="input"
            labelName="Password"
            labelId="name"
            {...register("password")}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setPassword(e.target.value)
            }
          />
          <span style={{ color: "red " }}>{errors.password?.message}</span>
          <a className="justify-items-end text-end  text-text_title" href="#">
            Forgot password?
          </a>
          <Button type="submit" text="Login now" backgroundColor="#FD7401" />
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
        />
        <Button
          onClick={registerUser}
          text="Signup now"
          backgroundColor="#FFFF"
          borderColor="#C2C2C2"
          color="#1E2772"
        />
      </div>
    </div>
  );
}
