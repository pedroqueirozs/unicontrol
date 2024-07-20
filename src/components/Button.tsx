import React from "react";

interface ButtonProps {
  text: string;
  icon?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  color?: string;
  onClick?: () => void;
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  borderColor = "FD7401",
  borderWidth = "1px",
  borderStyle = "solid",
  backgroundColor = "#FD7401",
  color = "#FFFF",
  onClick,
  ...props
}) => {
  return (
    <div>
      <button
        className="w-full h-10 flex justify-center items-center mt-3 gap-3  rounded-md hover:opacity-60"
        style={{
          backgroundColor,
          borderColor,
          borderWidth,
          borderStyle,
          color,
        }}
        onClick={onClick}
        {...props}
      >
        <img src={icon} alt="" />

        {text}
      </button>
    </div>
  );
};

export default Button;
