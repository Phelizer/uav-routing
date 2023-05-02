import { action, makeObservable, observable } from "mobx";
import { AuthService } from "../services/auth.service";

class LoginScreenBLoC {
  private readonly authService = new AuthService();

  constructor() {
    makeObservable(this);
  }

  @observable
  formData = {
    username: "",
    password: "",
  };

  @action
  setUsername = (value: string) => {
    this.formData.username = value;
  };

  @action
  setPassword = (value: string) => {
    this.formData.password = value;
  };

  submitForm = async () => {
    await this.authService.login(this.formData);
  };
}

export const loginScreenBLoCInstance = new LoginScreenBLoC();
