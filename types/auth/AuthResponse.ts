export interface AuthResponse {
  Status: boolean;
  Result: {
    UserId: number;
    FullName: string;
    FirstName: string;
    LastName: string;
    RoleId: number;
    RoleName: string;
    Token: string;
  } | null;
  errorCheck: boolean;
  errorMessage: string | null;
}
