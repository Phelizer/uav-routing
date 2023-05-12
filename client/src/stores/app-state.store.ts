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
}

export const appStateStoreInstance = new AppStateStore();
