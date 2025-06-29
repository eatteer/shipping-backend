import * as ModuleAlias from "module-alias";

ModuleAlias.addAliases({
  "@src": `${__dirname}`,
  "@domain": `${__dirname}/domain`,
  "@application": `${__dirname}/application`,
  "@infrastructure": `${__dirname}/infrastructure`,
});

import "dotenv/config";

import { FastifyAwilixOptions, fastifyAwilixPlugin } from "@fastify/awilix";
import fastifyEnvPlugin from "@fastify/env";
import fastifyJwtPlugin from "@fastify/jwt";
import fastifyPostgresPlugin from "@fastify/postgres";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import websocket from "@fastify/websocket";
import { asClass, asFunction, createContainer, InjectionMode } from "awilix";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

// Repositories
import { PostgresCityRepository } from "@infrastructure/database/postgres-city-repository";
import { PostgresRateRepository } from "@infrastructure/database/postgres-rate-repository";
import { PostgresShipmentRepository } from "@infrastructure/database/postgres-shipment-repository";
import { PostgresShipmentStatusHistoryRepository } from "@infrastructure/database/postgres-shipment-status-history-repository";
import { PostgresShipmentStatusRepository } from "@infrastructure/database/postgres-shipment-status-repository";
import { PostgresUserRepository } from "@infrastructure/database/postgres-user-repository";

// Use cases
import { AuthenticateUser } from "@application/use-cases/auth/authenticate-user";
import { RegisterUser } from "@application/use-cases/auth/register-user";
import { QuoteShipment } from "@application/use-cases/quotes/quote-shipment";
import { CreateShipment } from "@application/use-cases/shipments/create-shipment";
import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";

// Services
import { BcryptPasswordService } from "@application/services/password-service";
import { FastifyJwtTokenService } from "@application/services/token-service";
import { WebSocketService } from "@infrastructure/web/websocket/websocket-service";
import { PostgresNotificationService } from "@infrastructure/database/postgres-notification-service";

// Controllers
import { AuthController } from "@infrastructure/web/controllers/auth-controller";
import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";

// Routes
import { authRoutes } from "@infrastructure/web/routes/auth-routes";
import { shipmentRoutes } from "@infrastructure/web/routes/shipment-routes";
import { websocketRoutes } from "@infrastructure/web/routes/websocket-routes";

// Config
import { CONFIG_SCHEMA, getEnv } from "@src/config";

// Configuration schema for environment plugin
export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Register environment plugin
  await fastify.register(fastifyEnvPlugin, {
    confKey: "config",
    schema: CONFIG_SCHEMA,
    dotenv: true, // Enable dotenv through fastify-env
    data: process.env,
  });

  await fastify.register(websocket);

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
    webSocketService: asClass(WebSocketService).singleton(),
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
    shipmentRepository: asFunction(
      () => new PostgresShipmentRepository(fastify.pg)
    ).singleton(),
    shipmentStatusRepository: asFunction(
      () => new PostgresShipmentStatusRepository(fastify.pg)
    ).singleton(),
    shipmentStatusHistoryRepository: asFunction(
      () => new PostgresShipmentStatusHistoryRepository(fastify.pg)
    ).singleton(),

    // Services
    pg: asFunction(() => fastify.pg).singleton(),
    passwordService: asClass(BcryptPasswordService).singleton(),
    tokenService: asFunction(
      () => new FastifyJwtTokenService(fastify)
    ).singleton(),
    websocketService: asClass(WebSocketService).singleton(),
    postgresNotificationService: asClass(
      PostgresNotificationService
    ).singleton(),

    // Use cases
    registerUser: asClass(RegisterUser).singleton(),
    authenticateUser: asClass(AuthenticateUser).singleton(),
    quoteShipment: asClass(QuoteShipment).singleton(),
    createShipment: asClass(CreateShipment).singleton(),
    getShipmentTrackingDetails: asClass(GetShipmentTrackingDetails).singleton(),

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

  fastify.register(async (instance) => {
    const webSocketService =
      instance.diContainer.resolve<WebSocketService>("webSocketService");

    const getShipmentTrackingDetails =
      instance.diContainer.resolve<GetShipmentTrackingDetails>(
        "getShipmentTrackingDetails"
      );

    await websocketRoutes(instance, {
      webSocketService,
      getShipmentTrackingDetails,
    });
  });

  // Configure hooks
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.addHook("onReady", async () => {
    const postgresNotificationService =
      fastify.diContainer.resolve<PostgresNotificationService>(
        "postgresNotificationService"
      );

    await postgresNotificationService.startListening();
  });

  fastify.addHook("onClose", async () => {
    const postgresNotificationService =
      fastify.diContainer.resolve<PostgresNotificationService>(
        "postgresNotificationService"
      );

    await postgresNotificationService.stopListening();
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
