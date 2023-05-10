import React, { ComponentType, FC } from "react";
import { Navigate } from "react-router-dom";
import { appStateStoreInstance } from "./stores/app-state.store";

export const researcherOnly = <T extends object>(
  WrappedComponent: ComponentType<T>
): React.FC<T> => {
  const RoleProtectedRoute: FC<T> = (props) => {
    if (!appStateStoreInstance.roles.includes("researcher")) {
      return <Navigate to={"/"} />;
    }

    return <WrappedComponent {...props} />;
  };

  return RoleProtectedRoute;
};
