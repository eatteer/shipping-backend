import { FastifyInstance } from "fastify";

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenService {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}

export class FastifyJwtTokenService implements TokenService {
  private readonly fastify: FastifyInstance;

  public constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  public async generateToken(payload: TokenPayload): Promise<string> {
    return this.fastify.jwt.sign(payload);
  }

  public async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = (await this.fastify.jwt.verify(token)) as TokenPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token expired.");
      }

      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token.");
      }

      throw error;
    }
  }
}
