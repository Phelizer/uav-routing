import { runInAction } from "mobx";
import { LoginData, loginAPI } from "../api/auth/loginAPI";
import { appStateStoreInstance } from "../stores/app-state.store";

export class AuthService {
  login = async (loginData: LoginData) => {
    const accessToken = await loginAPI(loginData);
    runInAction(() => {
      appStateStoreInstance.setAccessToken(accessToken);
    });
  };
}
