declare namespace Express {
  export interface UserPayload {
    id: string;
    _id?: string;
    email?: string;
  }

  export interface Request {
    user?: UserPayload;
  }
}
