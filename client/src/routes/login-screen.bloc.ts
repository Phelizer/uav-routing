import { action, computed, makeObservable, observable } from "mobx";
import { AuthService } from "../services/auth.service";
import {
  isFormValid,
  isPresent,
  isRequiredErrorMsg,
  replaceXWithYARecursively,
} from "../utils/utils";
import spected, { SpecObject } from "spected";

interface LoginFormData {
  username: string;
  password: string;
}

class LoginScreenBLoC {
  private readonly authService = new AuthService();

  constructor() {
    makeObservable(this);
  }

  @computed
  get errors() {
    const errors = replaceXWithYARecursively(
      (v: unknown): v is true => v === true,
      []
    )(this.lastValidationResult);

    return errors;
  }

  @observable
  private lastValidationResult: Record<string, unknown> = {};

  @observable
  formData: LoginFormData = {
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

  private spec: SpecObject<LoginFormData> = {
    username: [[isPresent, isRequiredErrorMsg("Username")]],
    password: [[isPresent, isRequiredErrorMsg("Passsword")]],
  };

  @action
  private validate() {
    const res = spected(this.spec, this.formData);
    this.lastValidationResult = res;
    return isFormValid(res as any);
  }

  submitForm = async () => {
    const isValid = this.validate();
    if (!isValid) {
      return;
    }

    await this.authService.login(this.formData);
  };
}

export const loginScreenBLoCInstance = new LoginScreenBLoC();
