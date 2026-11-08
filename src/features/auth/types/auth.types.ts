export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}
