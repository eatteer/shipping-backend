import { FastifyInstance } from "fastify";
import { CityController } from "@src/infrastructure/web/controllers/city-controller";
import { CITY_ARRAY_RESPONSE_SCHEMA } from "@src/infrastructure/web/schemas/city-schemas";
import { INTERNAL_SERVER_ERROR_SCHEMA } from "@src/infrastructure/web/schemas/common-schemas";

interface CityRoutesDependencies {
  cityController: CityController;
}

export async function cityRoutes(
  fastify: FastifyInstance,
  { cityController }: CityRoutesDependencies
) {
  fastify.get(
    "/",
    {
      schema: {
        summary: "Get all cities",
        description: "Retrieves a list of all available cities.",
        tags: ["Cities"],
        response: {
          200: CITY_ARRAY_RESPONSE_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
      },
    },
    cityController.getAll.bind(cityController)
  );
}
