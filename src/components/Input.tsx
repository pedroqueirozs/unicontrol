import React from "react";

interface InputProps {
  id: string;
  type: string;
  placeholder: string;
  icon: string;
  className: string;
  labelName: string;
  labelId: string;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  icon,
  className,
  labelName,
  labelId,
  ...props
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block">
        {labelName}
      </label>
      <div className="relative mb-4">
        <input
          className="bg-[#F1F3F6] rounded-md h-10 w-full pl-3 pr-10 outline-none"
          id={id}
          type={type}
          placeholder={placeholder}
          {...props}
        />
        <div className="bg-[#FD7401] rounded-md flex absolute inset-y-0 right-0 items-center p-2 pointer-events-none w-9">
          <img src={icon} alt="icon" />
        </div>
      </div>
    </div>
  );
};

export default Input;
