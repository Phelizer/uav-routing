// @ts-ignore
import Cookies from "js-cookie";
import { action, makeObservable, observable } from "mobx";
import { CookieKeys } from "../utils/consts";
import { Role } from "../models";

class AppStateStore {
  @observable
  isLoggedIn = !!Cookies.get(CookieKeys.accessToken);

  @observable
  roles: Role[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  setAccessToken(token: string) {
    Cookies.set(CookieKeys.accessToken, token);
    this.isLoggedIn = true;
  }

  @action
  logout = () => {
    Cookies.remove(CookieKeys.accessToken);
    this.isLoggedIn = false;
    this.roles = [];
  };
}

export const appStateStoreInstance = new AppStateStore();
