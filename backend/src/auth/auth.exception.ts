import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export class UserExistsException extends HttpException {
  constructor() {
    super('UserExists', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
