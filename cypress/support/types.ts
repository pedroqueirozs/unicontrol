interface UserCredentials {
  email: string;
  password: string;
}

export interface UserFixture {
  validUser: UserCredentials;
  invalidUser: UserCredentials;
}
