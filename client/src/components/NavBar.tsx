import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/experiment">Perform Experiments</Link>
        </li>
        <li>
          <Link to="/">Solver</Link>
        </li>
      </ul>
    </nav>
  );
}
