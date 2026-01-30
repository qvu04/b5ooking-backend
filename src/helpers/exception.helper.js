import { statusCodes } from "./status-code.helper.js";


export class BadrequestException extends Error {
  constructor(message ) {
    super(message);
    this.name = 'BadrequestException';
    this.status = statusCodes.BAD_REQUEST;
  }
}

export class UnauthorizedException extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedException';
    this.status = statusCodes.UNAUTHORIZED;
  }
}

export class NotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundException';
    this.status = statusCodes.NOT_FOUND;
  }
}

export class ConflictException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictException';
    this.status = statusCodes.CONFLICT;
  }
}