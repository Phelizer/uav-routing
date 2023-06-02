import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { AuthService } from "../services/auth.service";
import { Role } from "../models";
import * as R from "ramda";
import {
  isFormValid,
  isPresent,
  isRequiredErrorMsg,
  replaceXWithYARecursively,
} from "../utils/utils";
import spected, { SpecObject } from "spected";

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

  private spec: SpecObject<Exclude<SignupFormData, "role">> = {
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
