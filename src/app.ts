import * as ModuleAlias from "module-alias";

ModuleAlias.addAliases({
  "@src": `${__dirname}`,
  "@domain": `${__dirname}/domain`,
  "@application": `${__dirname}/application`,
  "@infrastructure": `${__dirname}/infrastructure`,
});

import "dotenv/config";

import { FastifyAwilixOptions, fastifyAwilixPlugin } from "@fastify/awilix";
import cors from "@fastify/cors";
import fastifyEnvPlugin from "@fastify/env";
import fastifyJwtPlugin from "@fastify/jwt";
import fastifyPostgresPlugin from "@fastify/postgres";
import fastifyRedis from "@fastify/redis";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import websocket from "@fastify/websocket";
import { asClass, asFunction, createContainer, InjectionMode } from "awilix";
import Fastify from "fastify";

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
import { CreateShipment } from "@application/use-cases/shipments/create-shipment";
import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";
import { GetAllCities } from "@src/application/use-cases/city/get-all-cities";
import { QuoteShipment } from "@src/application/use-cases/shipments/quote-shipment";

// Services
import { PostgresNotificationService } from "@infrastructure/database/postgres-notification-service";
import { FastifyJwtTokenService } from "@infrastructure/security/fastify-token-service";
import { WebSocketService } from "@infrastructure/web/websocket/websocket-service";
import { RedisCacheService } from "@src/infrastructure/cache/redis-cache-service";
import { BcryptPasswordService } from "@src/infrastructure/security/bcrypt-password-service";

// Controllers
import { AuthController } from "@infrastructure/web/controllers/auth-controller";
import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import { CityController } from "@src/infrastructure/web/controllers/city-controller";

// Routes
import { authRoutes } from "@infrastructure/web/routes/auth-routes";
import { shipmentRoutes } from "@infrastructure/web/routes/shipment-routes";
import { websocketRoutes } from "@infrastructure/web/routes/websocket-routes";
import { cityRoutes } from "@src/infrastructure/web/routes/city-routes";

// Plugings
import { errorHandlerPlugin } from "@src/infrastructure/web/plugins/error-handler";

// Config
import { CONFIG_SCHEMA, getEnv } from "@src/config";

// Configuration schema for environment plugin
export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await fastify.register(cors);

  // Register error handler routes
  await fastify.register(errorHandlerPlugin);

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

  await fastify.register(fastifyRedis, {
    url: `redis://${getEnv(fastify).REDIS_HOST}:${getEnv(fastify).REDIS_PORT}`,
  });

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Shipment Tracking API",
        description: "API documentation shipment tracking service",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://127.0.0.1:${getEnv(fastify).PORT}`,
          description: "Development Server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      tags: [
        { name: "Auth", description: "User authentication related endpoints" },
        {
          name: "Shipments",
          description: "Shipment management and tracking endpoints",
        },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      filter: true,
      displayRequestDuration: true,
    },
    staticCSP: true, // Content Security Policy
    transformStaticCSP: (header) => header, // Custom transformation if needed
  });

  await fastify.after();

  // Configure the Dependency Injection Container (Awilix)
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    jwt: asFunction(() => fastify.jwt).singleton(),
    pg: asFunction(() => fastify.pg).singleton(),
    redis: asFunction(() => fastify.redis).singleton(),

    // Repositories
    userRepository: asClass(PostgresUserRepository).singleton(),
    cityRepository: asClass(PostgresCityRepository).singleton(),
    rateRepository: asClass(PostgresRateRepository).singleton(),
    shipmentRepository: asClass(PostgresShipmentRepository).singleton(),
    shipmentStatusRepository: asClass(
      PostgresShipmentStatusRepository
    ).singleton(),
    shipmentStatusHistoryRepository: asClass(
      PostgresShipmentStatusHistoryRepository
    ).singleton(),

    // Services
    passwordService: asClass(BcryptPasswordService).singleton(),
    tokenService: asClass(FastifyJwtTokenService).singleton(),
    webSocketService: asClass(WebSocketService).singleton(),
    cacheService: asClass(RedisCacheService).singleton(),

    postgresNotificationService: asClass(
      PostgresNotificationService
    ).singleton(),

    // Use cases
    registerUser: asClass(RegisterUser).singleton(),
    authenticateUser: asClass(AuthenticateUser).singleton(),
    quoteShipment: asClass(QuoteShipment).singleton(),
    createShipment: asClass(CreateShipment).singleton(),
    getShipmentTrackingDetails: asClass(GetShipmentTrackingDetails).singleton(),
    getAllCities: asClass(GetAllCities).singleton(),

    // Controllers
    authController: asClass(AuthController).singleton(),
    shipmentController: asClass(ShipmentController).singleton(),
    cityController: asClass(CityController).singleton(),
  });

  // Register Awilix plugin
  await fastify.register(fastifyAwilixPlugin, {
    container,
  } as FastifyAwilixOptions);

  // Configure hooks BEFORE routes
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Register Routes
  await fastify.register(
    async (instance) => {
      const authController =
        instance.diContainer.resolve<AuthController>("authController");
      await authRoutes(instance, { authController });
    },
    { prefix: "/auth" }
  );

  await fastify.register(
    async (instance) => {
      const shipmentController =
        instance.diContainer.resolve<ShipmentController>("shipmentController");
      await shipmentRoutes(instance, { shipmentController });
    },
    { prefix: "/shipments" }
  );

  await fastify.register(
    async (instance) => {
      const cityController =
        instance.diContainer.resolve<CityController>("cityController");
      await cityRoutes(instance, { cityController });
    },
    { prefix: "/cities" }
  );

  await fastify.register(async (instance) => {
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
