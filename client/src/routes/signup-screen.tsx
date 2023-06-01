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
      />

      <Input
        className="withTinyTopMargin"
        label="password"
        value={bloc.formData.password}
        onChange={bloc.setPassword}
        type="password"
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
        className="shrinkCustomButtonAmendments withTopMargin"
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
