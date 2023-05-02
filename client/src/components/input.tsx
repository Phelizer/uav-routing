import { useCallback } from "react";

interface InputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function Input({ label, value, error, onChange }: InputProps) {
  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div>
      <div>{label}</div>
      <input type="text" value={value} onChange={onChangeHandler}></input>
      {!!error && <div>{error}</div>}
    </div>
  );
}
