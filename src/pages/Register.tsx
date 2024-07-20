import emailIcon from "../../public/images/email_icon.svg";
import passwordIcon from "../../public/images/password_icon.svg";
import userIcon from "../../public/images/user_icon.svg";

import Input from "../components/Input";
import Button from "../components/Button";
import Header from "../components/Header";

export default function Register() {
  return (
    <div className="max-w-md mx-auto mt-20 text-text_description">
      <Header page="Register " />
      <div>
        <form className="flex flex-col" action="">
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            icon={userIcon}
            className="input"
            labelName="Name"
            labelId="name"
          />
          <Input
            id="user_email"
            type="email"
            placeholder="example@gmail.com"
            icon={emailIcon}
            className="input"
            labelName="Email address"
            labelId="email"
          />
          <Input
            id="confirm_email"
            type="email"
            placeholder="example@gmail.com"
            icon={emailIcon}
            className="input"
            labelName="Confirm Email"
            labelId="confirm_email"
          />
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            icon={passwordIcon}
            className="input"
            labelName="Password"
            labelId="name"
          />
          <Input
            id="confirm_password"
            type="password"
            placeholder="Confirm Password"
            icon={passwordIcon}
            className="input"
            labelName="Confirm Password"
            labelId="confirm_password"
          />

          <Button text="Register" backgroundColor="#FD7401" />
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
