import React from "react";

interface InputProps {
  id: string;
  icon: string;
  type: string;
  placeholder: string;
  labelName: string;
  labelId: string;
  errorsSpan: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { id, icon, type, placeholder, labelName, labelId, errorsSpan, ...props },
    ref
  ) => {
    return (
      <div>
        <div className="flex gap-1">
          <label htmlFor={labelId} className="mb-1 block">
            {labelName}
          </label>
          <span style={{ color: "red", fontSize: 14 }}> {errorsSpan}</span>
        </div>
        <div className="relative mb-2">
          <input
            className="bg-[#F1F3F6] rounded-md h-8 w-full pl-3 outline-none"
            id={id}
            type={type}
            placeholder={placeholder}
            ref={ref}
            {...props}
          />
          <div className="bg-[#FD7401]  rounded-md flex absolute inset-y-0 right-0 items-center p-0.5 pointer-events-none w-8">
            <div className="w-full text-center">
              <div className="text-tex_color_white w-full flex justify-center ">
                {" "}
                {icon}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
