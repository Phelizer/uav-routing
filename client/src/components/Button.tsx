import "./Button.css";

export function Button(props: JSX.IntrinsicElements["button"]) {
  return (
    <button {...props} className={`CustomButton ${props.className}`}></button>
  );
}
