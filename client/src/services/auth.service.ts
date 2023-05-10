import { runInAction } from "mobx";
import { LoginData, loginAPI } from "../api/auth/loginAPI";
import { appStateStoreInstance } from "../stores/app-state.store";

export class AuthService {
  login = async (loginData: LoginData) => {
    const { access_token, roles } = await loginAPI(loginData);
    runInAction(() => {
      appStateStoreInstance.setAccessToken(access_token);
      appStateStoreInstance.roles = roles;
    });
  };

  logout = appStateStoreInstance.logout;
}
