import logotipoDarkSvg from "../../assets/unicontrol-logo-dark.svg";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="max-w-xl px-8 pt-8 pb-16 mx-auto mt-20 text-text_descriptions">
      <div className="flex justify-center items-center gap-2 ">
        <img src={logotipoDarkSvg} alt="Logo" />
      </div>
      <Outlet />
    </div>
  );
}
