import React from "react";

interface Option {
  value: string;
  label: string;
}
interface InputSelectProps {
  id: string;
  labelName: string;
  labelId: string;
  errorsSpan: string;
  options: Option[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const InputSelect = React.forwardRef<HTMLSelectElement, InputSelectProps>(
  ({ id, labelName, labelId, errorsSpan, options, ...props }, ref) => {
    return (
      <div>
        <div className="flex gap-1">
          <label htmlFor={labelId} className="mb-1 block text-text_description">
            {labelName}
          </label>
          <span style={{ color: "red", fontSize: 14 }}> {errorsSpan}</span>
        </div>
        <div className="relative mb-2">
          <select
            className="bg-bg_input_color rounded-md h-9 w-full pl-3 outline-none border border-solid border-border_input_color"
            id={id}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);
InputSelect.displayName = "Input";

export default InputSelect;
