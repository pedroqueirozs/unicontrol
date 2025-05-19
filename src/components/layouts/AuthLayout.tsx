import logo from "../../../public/images/logo.svg";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="max-w-xl px-8 pt-8 pb-16 mx-auto mt-20 text-text_descriptions border border-solid border-border_input_color rounded-md">
      <div className="flex justify-center items-center gap-2 ">
        <img src={logo} alt="Logo" />
        <h1 className="text-text_title text-xl font-bold">Unicontrol</h1>
      </div>
      <Outlet />
    </div>
  );
}
