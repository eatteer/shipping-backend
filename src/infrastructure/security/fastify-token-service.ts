import { JWT } from "@fastify/jwt";
import {
  TokenPayload,
  TokenService,
} from "@src/application/services/token-service";
import { InvalidTokenError } from "@src/domain/errors/invalid-token-error";
import { TokenExpiredError } from "@src/domain/errors/token-expired-error";

export class FastifyJwtTokenService implements TokenService {
  public constructor(private readonly jwt: JWT) {}

  public async generateToken(payload: TokenPayload): Promise<string> {
    return this.jwt.sign(payload);
  }

  public async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = (await this.jwt.verify(token)) as TokenPayload;

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
