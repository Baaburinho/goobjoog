export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  public readonly isSuccess = true;
  public readonly isFailure = false;
  public readonly value: T;
  
  constructor(value: T) {
    this.value = value;
  }
}

export class Failure<E = Error> {
  public readonly isSuccess = false;
  public readonly isFailure = true;
  public readonly error: E;
  
  constructor(error: E) {
    this.error = error;
  }
}

// Utility functions
export const success = <T>(value: T): Result<T, never> => new Success(value);
export const failure = <E>(error: E): Result<never, E> => new Failure(error);
