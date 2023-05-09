import { NavBar } from "./components/NavBar";

interface WithNavBarProps {
  children: any;
}

export function WithNavBar({ children }: WithNavBarProps) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
