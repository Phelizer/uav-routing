import { action, makeObservable, observable } from "mobx";
import { AuthService } from "../services/auth.service";
import { Role } from "../models";

interface SignupFormData {
  username: string;
  password: string;
  role: Role;
}

class SignupScreenBLoC {
  private readonly authService = new AuthService();

  constructor() {
    makeObservable(this);
  }

  @observable
  formData: SignupFormData = {
    username: "",
    password: "",
    role: "user",
  };

  @action
  setUsername = (value: string) => {
    this.formData.username = value;
  };

  @action
  setPassword = (value: string) => {
    this.formData.password = value;
  };

  @action
  setRole = (value: Role) => {
    this.formData.role = value;
  };

  submitForm = async () => {
    // await this.authService.login(this.formData);
  };
}

export const signupScreenBLoCInstance = new SignupScreenBLoC();
