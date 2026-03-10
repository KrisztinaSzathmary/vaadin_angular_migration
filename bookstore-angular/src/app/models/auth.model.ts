export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  role: string;
}

export interface UserInfo {
  username: string;
  role: string;
}
