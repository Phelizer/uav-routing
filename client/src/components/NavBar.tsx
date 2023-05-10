import { Link, Navigate } from "react-router-dom";
import "./NavBar.css";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { NavBarBLoC } from "./NavBar.bloc";

export const NavBar = observer(() => {
  const bloc = useMemo(() => new NavBarBLoC(), []);

  return (
    <div className="nav-bar-container">
      <nav>
        <ul>
          {bloc.shouldExperimentBeAvailable && (
            <li>
              <Link to="/experiment">Perform Experiments</Link>
            </li>
          )}
          <li>
            <Link to="/">Solver</Link>
          </li>
        </ul>
      </nav>

      <button className="logout-button" onClick={bloc.logOutHandler}>
        Log out
      </button>

      {!bloc.isLoggedIn && <Navigate to={"/"} />}
    </div>
  );
});
