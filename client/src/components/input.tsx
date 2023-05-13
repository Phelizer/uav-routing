import { useCallback } from "react";

interface InputProps {
  label: string;
  value: string;
  error?: string;
  className?: string;
  onChange: (value: string) => void;
  type?: string;
}

export function Input({
  label,
  value,
  error,
  onChange,
  className,
  type = "text",
}: InputProps) {
  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div className={className}>
      <div>{label}</div>
      <input type={type} value={value} onChange={onChangeHandler}></input>
      {!!error && <div>{error}</div>}
    </div>
  );
}
