import { action, runInAction } from "mobx";
import { LoginData, loginAPI } from "../api/auth/loginAPI";
import { appStateStoreInstance } from "../stores/app-state.store";
import Cookies from "js-cookie";
import { CookieKeys } from "../utils/consts";

export class AuthService {
  login = async (loginData: LoginData) => {
    const { access_token, roles } = await loginAPI(loginData);
    runInAction(() => {
      Cookies.set(CookieKeys.accessToken, access_token);
      appStateStoreInstance.isLoggedIn = true;
      appStateStoreInstance.roles = roles;
    });
  };

  @action
  logout = () => {
    Cookies.remove(CookieKeys.accessToken);
    appStateStoreInstance.isLoggedIn = false;
    appStateStoreInstance.roles = [];
  };
}
