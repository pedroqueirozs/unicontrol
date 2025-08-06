import React from "react";

interface InputProps {
  id: string;
  icon?: string;
  type: string;
  placeholder?: string;
  labelName: string;
  labelId: string;
  errorMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { id, icon, type, placeholder, labelName, labelId, errorMessage, ...props },
    ref
  ) => {
    return (
      <div>
        <div className="flex gap-1">
          <label htmlFor={labelId} className="mb-1 block text-text_description">
            {labelName}
          </label>
          <span className="text-color_error text-sm"> {errorMessage}</span>
        </div>
        <div className="relative mb-2">
          <input
            className="bg-bg_input_color rounded-md h-11 w-full pl-3 outline-none border border-solid border-border_input_color focus:border-color_secondary"
            id={id}
            type={type}
            placeholder={placeholder}
            ref={ref}
            {...props}
          />
          {icon && (
            <div className="bg-color_secondary rounded-md flex absolute inset-y-0 right-0 items-center pointer-events-none w-8">
              <div className="w-full text-center">
                <div className="text-text_color_white w-full flex justify-center ">
                  {" "}
                  {icon}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
