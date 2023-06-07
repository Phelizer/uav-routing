import "./CrossButton.css";

export function CrossButton(props: JSX.IntrinsicElements["button"]) {
  return (
    <button
      {...props}
      className={`red-cross-button ${props.className}`}
    ></button>
  );
}
