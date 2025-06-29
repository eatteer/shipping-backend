import { QuoteShipment } from "@application/use-cases/quotes/quote-shipment";
import { CreateShipment } from "@application/use-cases/shipments/create-shipment";
import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";
import { ApplicationError } from "@domain/errors/application-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { ValidationError } from "@domain/errors/validation-error";
import {
  CreateShipmentBody,
  GetShipmentTrackingParams,
  QuoteShipmentBody,
} from "@infrastructure/web/schemas/shipment-schemas";
import { FastifyReply, FastifyRequest } from "fastify";

export class ShipmentController {
  public constructor(
    private readonly quoteShipment: QuoteShipment,
    private readonly createShipment: CreateShipment,
    private readonly getShipmentTrackingDetails: GetShipmentTrackingDetails
  ) {}

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
        reply.code(404).send({ message: error.message, code: error.code });
      } else {
        request.log.error(error);

        reply.code(500).send({ message: "Internal server error" });
      }
    }
  }

  public async create(
    request: FastifyRequest<{ Body: CreateShipmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const {
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageLengthCm,
        packageWidthCm,
        packageHeightCm,
      } = request.body;

      await this.createShipment.execute({
        userId: request.user.userId,
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageLengthCm,
        packageWidthCm,
        packageHeightCm,
      });

      reply.code(201);
    } catch (error: unknown) {
      request.log.error(error);

      if (error instanceof NotFoundError) {
        return reply
          .code(404)
          .send({ message: error.message, errorCode: error.code });
      }
      if (error instanceof SameOriginDestinationCityError) {
        return reply
          .code(400)
          .send({ message: error.message, errorCode: error.code });
      }

      if (error instanceof ValidationError) {
        reply.code(400).send({
          message: error.message,
          errorCode: error.code,
          details: (error as any).details,
        });
      }

      if (error instanceof ApplicationError) {
        return reply.code(500).send({
          message: error.message,
          errorCode: error.code,
        });
      }

      reply.code(500).send({
        message: "Internal server error",
        errorCode: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  public async getTrackingDetails(
    request: FastifyRequest<{ Params: GetShipmentTrackingParams }>,
    reply: FastifyReply
  ) {
    const { id: shipmentId } = request.params;

    try {
      const trackingDetails = await this.getShipmentTrackingDetails.execute({
        shipmentId,
        userId: request.user.userId,
      });

      reply.status(200).send(trackingDetails);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.status(404).send({ message: error.message });
      } else if (error instanceof ApplicationError) {
        reply.status(400).send({ message: error.message, code: error.code });
      } else {
        request.log.error(error);
        reply.status(500).send({ message: "An unexpected error occurred." });
      }
    }
  }
}
