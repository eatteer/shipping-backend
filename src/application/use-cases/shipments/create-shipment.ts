import { QuoteShipment } from "@application/use-cases/shipments/quote-shipment";
import { Shipment } from "@domain/entities/shipment";
import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { UserRepository } from "@domain/repositories/user-repository";

export type CreateShipmentRequest = {
  userId: string;
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
};

export type CreateShipmentResponse = {
  shipmentId: string;
};

export class CreateShipment {
  public constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly userRepository: UserRepository,
    private readonly quoteShipment: QuoteShipment
  ) {}

  public async execute(
    request: CreateShipmentRequest
  ): Promise<CreateShipmentResponse> {
    const {
      userId,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request;

    // 1. Validate if the requesting user exists
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // 2. Obtain the shipment quote
    const { calculatedWeightKg, quotedValue } =
      await this.quoteShipment.execute({
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageHeightCm,
        packageWidthCm,
        packageLengthCm,
      });

    // 3. Create a new Shipment
    const shipment = new Shipment({
      userId: user.id,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
      calculatedWeightKg,
      quotedValue,
    });

    // 4. Persist the new shipment
    await this.shipmentRepository.save(shipment);

    // 5. Return the ID
    return {
      shipmentId: shipment.id,
    };
  }
}
