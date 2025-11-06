import React from "react";

interface Option {
  value: string;
  label: string;
}
interface InputSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  labelName: string;
  labelId: string;
  options: Option[];
}

const InputSelect = React.forwardRef<HTMLSelectElement, InputSelectProps>(
  ({ id, labelName, labelId, options, ...props }, ref) => {
    return (
      <div>
        <div className="flex gap-1">
          <label htmlFor={labelId} className="mb-1 block">
            {labelName}
          </label>
        </div>
        <div className="relative mb-2">
          <select
            className="rounded-md h-11 w-full pl-3 outline-none bg-input_bg border border-solid border-input_border focus:border-input_border_focus"
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
