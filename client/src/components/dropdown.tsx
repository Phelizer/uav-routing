import { useCallback } from "react";
import "./dropdown.css";

interface DropdownProps<OptionType extends string> {
  className?: string;
  value: OptionType;
  onChange: (value: OptionType) => void;
  options: Readonly<string[]>;
  label: string;
}

export function Dropdown<OptionType extends string>({
  className,
  onChange,
  value,
  options,
  label,
}: DropdownProps<OptionType>) {
  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value as OptionType);
    },
    [onChange]
  );

  return (
    <div>
      <div>{label}</div>

      <select
        className={`dropdown-container ${className}`}
        value={value}
        onChange={onChangeHandler}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
