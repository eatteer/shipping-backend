import { InvalidTokenError } from "@domain/errors/invalid-token-error";
import { TokenExpiredError } from "@domain/errors/token-expired-error";
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
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw new TokenExpiredError();
      }

      if (error instanceof Error && error.name === "JsonWebTokenError") {
        throw new InvalidTokenError();
      }

      throw error;
    }
  }
}
