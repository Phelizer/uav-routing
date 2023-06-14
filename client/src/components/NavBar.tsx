import { Navigate, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo } from "react";
import { NavBarBLoC } from "./NavBar.bloc";
import { Button } from "./Button";

export const NavBar = observer(() => {
  const bloc = useMemo(() => new NavBarBLoC(), []);
  const navigate = useNavigate();
  const goToExperiment = useCallback(
    () => navigate(bloc.experimentRoute),
    [bloc.experimentRoute, navigate]
  );

  const goToSolver = useCallback(
    () => navigate(bloc.solverRoute),
    [bloc.solverRoute, navigate]
  );

  return (
    <div className="nav-bar-container">
      <div className="nav-bar">
        <Button className="nav-button" onClick={goToSolver}>
          Solver
        </Button>
        <Button className="nav-button" onClick={goToExperiment}>
          Perform Experiments
        </Button>
      </div>

      <Button className="nav-button" onClick={bloc.logOutHandler}>
        Log out
      </Button>

      {!bloc.isLoggedIn && <Navigate to={"/"} />}
    </div>
  );
});
