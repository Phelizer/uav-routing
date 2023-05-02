// @ts-ignore
import Cookies from "js-cookie";
import { action, makeObservable, observable } from "mobx";
import { CookieKeys } from "../utils/consts";

class AppStateStore {
  @observable
  isLoggedIn = false;

  constructor() {
    makeObservable(this);
  }

  @action
  setAccessToken(token: string) {
    Cookies.set(CookieKeys.accessToken, token);
    this.isLoggedIn = true;
  }
}

export const appStateStoreInstance = new AppStateStore();
