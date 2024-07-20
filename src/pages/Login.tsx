import emailIcon from "../../public/images/email_icon.svg";
import passwordIcon from "../../public/images/password_icon.svg";
import googleIcon from "../../public/images/google_icon.svg";

import Input from "../components/Input";
import Button from "../components/Button";
import Header from "../components/Header";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

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
        <form className="flex flex-col" action="">
          <Input
            id="user_email"
            type="email"
            placeholder="Enter your user email"
            icon={emailIcon}
            className="input"
            labelName="Email address"
            labelId="email"
          />
          <Input
            id="user_password"
            type="password"
            placeholder="Enter your password"
            icon={passwordIcon}
            className="input"
            labelName="Password"
            labelId="Password"
          />
          <a className="justify-items-end text-end  text-text_title" href="#">
            Forgot password?
          </a>
          <Button
            onClick={loginNow}
            text="Login now"
            backgroundColor="#FD7401"
          />
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
