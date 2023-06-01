import Cookies from "js-cookie";
import { makeObservable, observable } from "mobx";
import { CookieKeys } from "../utils/consts";
import { Role } from "../models";

class AppStateStore {
  @observable
  isLoggedIn = !!Cookies.get(CookieKeys.accessToken);

  @observable
  roles: Role[] = Cookies.get(CookieKeys.roles)
    ? (JSON.parse(Cookies.get(CookieKeys.roles) as any) as Role[])
    : [];

  constructor() {
    makeObservable(this);
  }
}

export const appStateStoreInstance = new AppStateStore();
