import { action, makeObservable, observable, runInAction } from "mobx";
import { AuthService } from "../services/auth.service";
import { Role } from "../models";
import * as R from "ramda";

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
  signedupSuccessfully = false;

  @observable
  errorMsg: string | undefined = undefined;

  private readonly INITIAL_FORM_DATA: SignupFormData = {
    username: "",
    password: "",
    role: "user",
  };

  @observable
  formData: SignupFormData = R.clone(this.INITIAL_FORM_DATA);

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
    const signupData = {
      username: this.formData.username,
      password: this.formData.password,
      roles: [this.formData.role],
    };

    const errorMsg = await this.authService.signup(signupData);
    runInAction(() => {
      this.errorMsg = errorMsg;
      if (!errorMsg) {
        this.signedupSuccessfully = true;
        setTimeout(() => this.clearState(), 50);
      }
    });
  };

  @action
  clearState() {
    this.formData = R.clone(this.INITIAL_FORM_DATA);
    this.signedupSuccessfully = false;
    this.errorMsg = undefined;
  }
}

export const signupScreenBLoCInstance = new SignupScreenBLoC();
