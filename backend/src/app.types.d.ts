// This file contains the types that are used in the application

//TODO: Do a global type declaration file instead
export type AuthRequest = {
  email: string;
  password: number;
  username: string;
};

type Header = {};

type Body = {
  username: string;
  token: string;
};

export type AuthResponse = {
  status: number;
  headers: Header;
  body: Body;
};
