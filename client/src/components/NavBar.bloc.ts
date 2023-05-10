import { computed, makeObservable } from "mobx";
import { appStateStoreInstance } from "../stores/app-state.store";
import { AuthService } from "../services/auth.service";

export class NavBarBLoC {
  private authService = new AuthService();

  constructor() {
    makeObservable(this);
  }

  @computed
  get isLoggedIn() {
    return appStateStoreInstance.isLoggedIn;
  }

  logOutHandler = this.authService.logout;

  @computed
  get shouldExperimentBeAvailable() {
    return appStateStoreInstance.roles.includes("researcher");
  }
}
