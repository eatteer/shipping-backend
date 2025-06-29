import { QuoteShipment } from "@src/application/use-cases/shipments/quote-shipment";
import { Shipment } from "@domain/entities/shipment";
import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { UserRepository } from "@domain/repositories/user-repository";

export interface CreateShipmentRequest {
  userId: string;
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
}

export class CreateShipment {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly userRepository: UserRepository,
    private readonly quoteShipment: QuoteShipment
  ) {}

  async execute(request: CreateShipmentRequest) {
    const {
      userId,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError().setEntityName("User");
    }

    const { calculatedWeightKg, quotedValue } =
      await this.quoteShipment.execute({
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageHeightCm,
        packageWidthCm,
        packageLengthCm,
      });

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

    await this.shipmentRepository.save(shipment);
  }
}
