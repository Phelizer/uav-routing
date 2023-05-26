import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";
import { AuthWrapper } from "./AuthWrapper";
import { WithNavBar } from "./WithNavBar";
import { ExperimentScreen } from "./routes/experiment-screen";
import { SignupScreen } from "./routes/signup-screen";

// TODO: remove this verification code:
if (
  !new (class {
    x: any;
  })().hasOwnProperty("x")
)
  throw new Error("Transpiler is not configured correctly");

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthWrapper />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/experiment",
    element: (
      <WithNavBar>
        <ExperimentScreen />
      </WithNavBar>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <SignupScreen />,
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
