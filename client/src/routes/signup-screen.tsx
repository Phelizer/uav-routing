import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { useWithPreventedDefault } from "../utils/useWithPreventedDefault";
import { Dropdown } from "../components/dropdown";
import { signupScreenBLoCInstance as bloc } from "./signup-screen.bloc";
import { ROLES } from "../models";
import "./signup-screen.css";
import { Link, Navigate } from "react-router-dom";

export const SignupScreen = observer(() => {
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

        <Dropdown
          label="Role"
          value={bloc.formData.role}
          onChange={bloc.setRole}
          options={ROLES}
        />

        <button type="submit">Sign up</button>

        {!!bloc.errorMsg && (
          <div className="errorMsg withLeftMargin withTopMargin">
            {bloc.errorMsg}
          </div>
        )}

        {bloc.signedupSuccessfully && <Navigate to={"/"} />}

        <Link to="/">Already have account?</Link>
      </form>
    </div>
  );
});
