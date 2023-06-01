import { action, runInAction } from "mobx";
import { LoginData, loginAPI } from "../api/auth/loginAPI";
import { appStateStoreInstance } from "../stores/app-state.store";
import Cookies from "js-cookie";
import { CookieKeys } from "../utils/consts";
import { SignupData, signupAPI } from "../api/auth/signupAPI";
import { Role, isHttpError } from "../models";

export class AuthService {
  login = async (loginData: LoginData) => {
    const { access_token, roles } = await loginAPI(loginData);
    this.saveLoginDataLocally(access_token, roles);
  };

  // returns error string
  signup = async (signupData: SignupData): Promise<string | undefined> => {
    const result = await signupAPI(signupData);
    if (!isHttpError(result)) {
      const { access_token, roles } = result;
      this.saveLoginDataLocally(access_token, roles);
      return;
    }

    return result.message;
  };

  private saveLoginDataLocally(access_token: string, roles: Role[]) {
    runInAction(() => {
      Cookies.set(CookieKeys.accessToken, access_token);
      this.setRoles(roles);
      appStateStoreInstance.isLoggedIn = true;
    });
  }

  @action
  logout = () => {
    Cookies.remove(CookieKeys.accessToken);
    Cookies.remove(CookieKeys.roles);
    appStateStoreInstance.isLoggedIn = false;
    appStateStoreInstance.roles = [];
  };

  setRoles = (roles: Role[]) => {
    Cookies.set(CookieKeys.roles, JSON.stringify(roles));
    appStateStoreInstance.roles = roles;
  };
}
