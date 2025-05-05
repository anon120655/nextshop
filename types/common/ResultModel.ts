export interface ResultModel<T> {
  Status: boolean;
  Result?: T;
  errorCheck: boolean;
  errorMessage: string | null;
}
