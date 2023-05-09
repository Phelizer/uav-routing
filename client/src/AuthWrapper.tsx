import { observer } from "mobx-react-lite";
import { appStateStoreInstance } from "./stores/app-state.store";
import { SolverScreen } from "./routes/solver-screen";
import { LoginScreen } from "./routes/login-screen";
import { WithNavBar } from "./WithNavBar";

export const AuthWrapper = observer(() => {
  return appStateStoreInstance.isLoggedIn ? (
    <WithNavBar>
      <SolverScreen />
    </WithNavBar>
  ) : (
    <LoginScreen />
  );
});
