import emailIcon from "../../../public/images/email_icon.svg";
import passwordIcon from "../../../public/images/password_icon.svg";
import userIcon from "../../../public/images/user_icon.svg";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Input from "../../components/Input";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { useState, SetStateAction } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");

  const schema = yup.object({
    name: yup.string().required("*"),
    user_email: yup.string().email("Digite um e-mail valido ").required("*"),
    confirm_email: yup
      .string()
      .required("*")
      .oneOf([yup.ref("user_email")], "Os emails não são iguais"),
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
  function teste() {
    alert("ola");
  }
  return (
    <div className="max-w-md mx-auto mt-20 text-text_description">
      <Header page="Register " />
      <div>
        <form
          onSubmit={handleSubmit(teste)}
          className="flex flex-col"
          action=""
        >
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            icon={userIcon}
            className="input"
            labelName="Name"
            labelId="name"
            {...register("name")}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setPassword(e.target.value)
            }
            errorsSpan={errors.name?.message}
          />

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
            errorsSpan={errors.user_email?.message}
          />

          <Input
            id="confirm_email"
            type="email"
            placeholder="example@gmail.com"
            icon={emailIcon}
            className="input"
            labelName="Confirm Email"
            labelId="confirm_email"
            {...register("confirm_email")}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setEmail(e.target.value)
            }
            errorsSpan={errors.confirm_email?.message}
          />
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
            errorsSpan={errors.password?.message}
          />
          <Input
            id="confirm_password"
            type="password"
            placeholder="Confirm Password"
            icon={passwordIcon}
            className="input"
            labelName="Confirm Password"
            labelId="confirm_password"
            {...register("confirm_password")}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setConfPassword(e.target.value)
            }
            errorsSpan={errors.confirm_password?.message}
          />

          <Button type="onSubmit" text="Register" backgroundColor="#FD7401" />
        </form>
        <div className="justify-center mt-8 flex gap-4 ">
          <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
          <div className="text-[#C2C2C2]">OR</div>
          <div className="h-0.5 w-full bg-[#C2C2C2] m-auto"></div>
        </div>
        <Button
          text="Close"
          backgroundColor="#FFFF"
          borderColor="#FD7401"
          color="#FD7401"
        />
      </div>
    </div>
  );
}
