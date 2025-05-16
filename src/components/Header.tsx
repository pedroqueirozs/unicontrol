import React from "react";
import logo from "../../public/images/logo.svg";

interface HeaderProps {
  page: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Header: React.FC<HeaderProps> = ({ page }) => {
  return (
    <div>
      <div className="flex justify-center items-center gap-2 ">
        <img src={logo} alt="Logo" />
        <h1 className="text-text_title text-xl font-bold">Unicontrol</h1>
      </div>
      <span className="flex justify-center pt-5 mb-5">
        {page} 
      </span>
    </div>
  );
};

export default Header;
