import { observer } from "mobx-react-lite";
import { appStateStoreInstance } from "./stores/app-state.store";
import { SolverScreen } from "./routes/solver-screen";
import { LoginScreen } from "./routes/login-screen";
import { NavBar } from "./components/NavBar";

export const AuthWrapper = observer(() => {
  return (
    <>
      <NavBar />
      {appStateStoreInstance.isLoggedIn ? <SolverScreen /> : <LoginScreen />}
    </>
  );
});
