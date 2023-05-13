import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { loginScreenBLoCInstance as bloc } from "./login-screen.bloc";
import { useWithPreventedDefault } from "../utils/useWithPreventedDefault";

export const LoginScreen = observer(() => {
  const onSubmit = useWithPreventedDefault(bloc.submitForm);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <Input
          label="username"
          value={bloc.formData.username}
          onChange={bloc.setUsername}
        />

        <Input
          label="password"
          value={bloc.formData.password}
          onChange={bloc.setPassword}
          type="password"
        />

        <button type="submit">Log in</button>
      </form>
    </div>
  );
});
