import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { useWithPreventedDefault } from "../utils/useWithPreventedDefault";
import { Dropdown } from "../components/dropdown";
import { signupScreenBLoCInstance as bloc } from "./signup-screen.bloc";
import { ROLES } from "../models";
import "./signup-screen.css";
import { Link, Navigate } from "react-router-dom";
import { Button } from "../components/Button";

export const SignupScreen = observer(() => {
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

      <div className="withTinyTopMargin">
        <Dropdown
          className="standartInputWidth"
          label="role"
          value={bloc.formData.role}
          onChange={bloc.setRole}
          options={ROLES}
        />
      </div>

      <Button
        className="shrinkCustomButtonAmendments withTinyTopMargin"
        type="submit"
        onClick={submit}
      >
        Sign up
      </Button>

      {!!bloc.errorMsg && (
        <div className="errorMsg withLeftMargin withTinyTopMargin">
          {bloc.errorMsg}
        </div>
      )}

      {bloc.signedupSuccessfully && <Navigate to={"/"} />}

      <div className="withTopMargin">
        <Link to="/">Already have account?</Link>
      </div>
    </div>
  );
});
