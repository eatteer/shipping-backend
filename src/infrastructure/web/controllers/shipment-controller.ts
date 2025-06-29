import { QuoteShipment } from "@src/application/use-cases/shipments/quote-shipment";
import { CreateShipment } from "@application/use-cases/shipments/create-shipment";
import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";
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

    reply.code(200).send(response);
  }

  public async create(
    request: FastifyRequest<{ Body: CreateShipmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const {
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request.body;

    const response = await this.createShipment.execute({
      userId: request.user.userId,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    });

    reply.code(201).send(response);
  }

  public async getTrackingDetails(
    request: FastifyRequest<{ Params: GetShipmentTrackingParams }>,
    reply: FastifyReply
  ) {
    const { id: shipmentId } = request.params;

    const trackingDetails = await this.getShipmentTrackingDetails.execute({
      shipmentId,
      userId: request.user.userId,
    });

    reply.status(200).send(trackingDetails);
  }
}
