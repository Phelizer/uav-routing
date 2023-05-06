import { observer } from "mobx-react-lite";
import { appStateStoreInstance } from "./stores/app-state.store";
import { MainScreen } from "./routes/main-screen";
import { LoginScreen } from "./routes/login-screen";

export const AuthWrapper = observer(() => {
  return appStateStoreInstance.isLoggedIn ? <MainScreen /> : <LoginScreen />;
});
