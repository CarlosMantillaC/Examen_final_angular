export class User {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export interface LoginResponse {
  code: number;
  data: {
    token: string;
    expiresAt: Date;
  }
  message: string;
}
