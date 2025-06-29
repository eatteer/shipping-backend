export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenService {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}
