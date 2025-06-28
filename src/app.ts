import "dotenv/config";

import { asClass, asFunction, createContainer, InjectionMode } from "awilix";
import Fastify, { FastifyInstance } from "fastify";

// Fastify plugins
import { FastifyAwilixOptions, fastifyAwilixPlugin } from "@fastify/awilix";
import fastifyEnvPlugin from "@fastify/env";
import fastifyJwtPlugin from "@fastify/jwt";
import fastifyPostgresPlugin from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

// Repositories
import { PostgresUserRepository } from "@infrastructure/database/postgres-user-repository";

// Use cases
import { AuthenticateUser } from "@application/use-cases/auth/authenticate-user";
import { RegisterUser } from "@application/use-cases/auth/register-user";

// Services
import { BcryptPasswordService } from "@application/services/password-service";
import { FastifyJwtTokenService } from "@application/services/token-service";

// Controllers
import { AuthController } from "@infrastructure/web/controllers/auth-controller";

// Routes
import { QuoteShipment } from "@application/use-cases/quotes/quote-shipment";
import { PostgresCityRepository } from "@infrastructure/database/postgres-city-repository";
import { PostgresRateRepository } from "@infrastructure/database/postgres-rate-repository";
import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import { authRoutes } from "@infrastructure/web/routes/auth-routes";
import { shipmentRoutes } from "@infrastructure/web/routes/shipment-routes";

// Configuration schema for environment plugin
const CONFIG_SCHEMA = {
  type: "object",
  required: [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
  ],
  properties: {
    PORT: { type: "number", default: 3000 },
    DB_HOST: { type: "string" },
    DB_PORT: { type: "number" },
    DB_USER: { type: "string" },
    DB_PASSWORD: { type: "string" },
    DB_NAME: { type: "string" },
    JWT_SECRET: { type: "string" },
    JWT_EXPIRES_IN: { type: "string" },
  },
};

function getEnv(fastify: FastifyInstance): Record<string, any> {
  // @ts-expect-error
  return fastify.config;
}

export async function buildApp() {
  const fastify: FastifyInstance = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register environment plugin
  await fastify.register(fastifyEnvPlugin, {
    confKey: "config",
    schema: CONFIG_SCHEMA,
    dotenv: true, // Enable dotenv through fastify-env
    data: process.env,
  });

  // Register JWT plugin
  await fastify.register(fastifyJwtPlugin, {
    secret: getEnv(fastify).JWT_SECRET,
    sign: {
      expiresIn: getEnv(fastify).JWT_EXPIRES_IN,
    },
  });

  // Register PostgreSQL plugin
  await fastify.register(fastifyPostgresPlugin, {
    connectionString: `postgres://${getEnv(fastify).DB_USER}:${
      getEnv(fastify).DB_PASSWORD
    }@${getEnv(fastify).DB_HOST}:${getEnv(fastify).DB_PORT}/${
      getEnv(fastify).DB_NAME
    }`,
  });

  // Wait for the database connection to be ready
  await fastify.after();

  // Configure the Dependency Injection Container (Awilix)
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    // Repositories
    userRepository: asFunction(
      () => new PostgresUserRepository(fastify.pg)
    ).singleton(),
    cityRepository: asFunction(
      () => new PostgresCityRepository(fastify.pg)
    ).singleton(),
    rateRepository: asFunction(
      () => new PostgresRateRepository(fastify.pg)
    ).singleton(),

    // Services
    passwordService: asClass(BcryptPasswordService).singleton(),
    tokenService: asFunction(
      () => new FastifyJwtTokenService(fastify)
    ).singleton(),

    // Use cases
    registerUser: asClass(RegisterUser).singleton(),
    authenticateUser: asClass(AuthenticateUser).singleton(),
    quoteShipment: asClass(QuoteShipment).singleton(),

    // Controllers
    authController: asClass(AuthController).singleton(),
    shipmentController: asClass(ShipmentController).singleton(),
  });

  // Register Awilix plugin
  await fastify.register(fastifyAwilixPlugin, {
    container,
  } as FastifyAwilixOptions);

  // Register Routes
  fastify.register(
    async (instance) => {
      const authController =
        instance.diContainer.resolve<AuthController>("authController");
      await authRoutes(instance, { authController });
    },
    { prefix: "/auth" }
  );

  fastify.register(
    async (instance) => {
      const shipmentController =
        instance.diContainer.resolve<ShipmentController>("shipmentController");
      await shipmentRoutes(instance, { shipmentController });
    },
    { prefix: "/shipments" }
  );

  // Configure hooks
  fastify.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  return fastify;
}

// Start the application if executed directly
if (require.main === module) {
  buildApp()
    .then((fastify) => {
      const port = getEnv(fastify).PORT;

      fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
        if (err) {
          fastify.log.error(err);
          process.exit(1);
        }

        fastify.log.info(`Server listening on ${address}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}
