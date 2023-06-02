import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { loginScreenBLoCInstance as bloc } from "./login-screen.bloc";
import { useWithPreventedDefault } from "../utils/useWithPreventedDefault";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export const LoginScreen = observer(() => {
  const submit = useWithPreventedDefault(bloc.submitForm);

  return (
    <div className="authContainer">
      <Input
        label="username"
        value={bloc.formData.username}
        onChange={bloc.setUsername}
        error={(bloc.errors as any)?.username?.[0]}
      />

      <Input
        className="withTinyTopMargin"
        label="password"
        value={bloc.formData.password}
        onChange={bloc.setPassword}
        type="password"
        error={(bloc.errors as any)?.password?.[0]}
      />

      <Button
        className="shrinkCustomButtonAmendments withTopMargin"
        onClick={submit}
      >
        Log in
      </Button>

      <div className="withTopMargin">
        <Link to="/signup">Need account?</Link>
      </div>
    </div>
  );
});
