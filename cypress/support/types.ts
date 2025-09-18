interface UserCredentials {
  email: string;
  password: string;
}

export interface UserFixture {
  validUser: UserCredentials;
  invalidUser: UserCredentials;
}

interface NewUserCredential {
  name: string;
  email: string;
  confirm_email: string;
  password: string;
  confirm_password: string;
}

export interface NewUserFixture {
  newUserValid: NewUserCredential;
  newUserEmailDifferent: NewUserCredential;
  newUserPasswordDifferent: NewUserCredential;
  newUserPasswordShort: NewUserCredential;
  newUserEmptyFields: NewUserCredential;
}
