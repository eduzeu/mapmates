import express from "express";

abstract class DataError extends Error {
  statusCode: number;

  constructor(message: string, name: string, statusCode: number) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class ServerError extends DataError {
  constructor(message) {
    super(message, "DatabaseError", 500);
  }
}

export class ValidationError extends DataError {
  constructor(message) {
    super(message, "ValidationError", 400);
  }
}

export class NotFoundError extends DataError {
  constructor(message) {
    super(message, "NotFoundError", 404);
  }
}

export class AuthorizationError extends DataError {
  constructor(message) {
    super(message, "AuthorizationError", 401);
  }
}

export const handleErrors = (
  res: express.Response,
  err: any,
  defaultCode: number
): express.Response<ErrorResponse> => {
  if (err instanceof DataError) {
    return res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof Error) {
    return res.status(defaultCode).json({ error: err.message });
  } else {
    return res
      .status(defaultCode)
      .json({ error: "An unknown error has occured. " });
  }
};

export interface ErrorResponse {
  error: string;
}
