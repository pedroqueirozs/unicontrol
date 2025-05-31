import React from "react";

interface ButtonProps {
  text?: string;
  icon?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  color?: string;
  type?: string;
  onClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  borderColor = "FD7401",
  borderWidth = "1px",
  borderStyle = "solid",
  backgroundColor = "#F39C12",
  color = "#FFFF",
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type,
  ...props
}) => {
  return (
    <div>
      <button
        className="w-full h-9 flex justify-center items-center mt-3 gap-3 p-2  rounded-md hover:opacity-60"
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
        {icon && <img src={icon} alt="" />}
        {text}
      </button>
    </div>
  );
};

export default Button;
