import { QuoteShipment } from "@application/use-cases/quotes/quote-shipment";
import { NotFoundError } from "@domain/errors/not-found-error";
import { QUOTE_SHIPMENT_BODY_SCHEMA } from "@infrastructure/web/schemas/shipment-schemas";
import { Static } from "@sinclair/typebox";
import { FastifyReply, FastifyRequest } from "fastify";

type QuoteShipmentBody = Static<typeof QUOTE_SHIPMENT_BODY_SCHEMA>;

export class ShipmentController {
  public constructor(private readonly quoteShipment: QuoteShipment) {}

  public async quote(
    request: FastifyRequest<{ Body: QuoteShipmentBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageHeightCm,
        packageWidthCm,
        packageLengthCm,
      } = request.body;

      const response = await this.quoteShipment.execute({
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageHeightCm,
        packageWidthCm,
        packageLengthCm,
      });

      reply.code(201).send(response);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        reply.code(409).send({ message: error.message, code: error.code });
      } else {
        request.log.error(error);

        reply.code(500).send({ message: "Internal server error" });
      }
    }
  }
}
