import { GetAllCities } from "@src/application/use-cases/city/get-all-cities";
import { FastifyReply, FastifyRequest } from "fastify";

export class CityController {
  public constructor(private readonly getAllCities: GetAllCities) {}

  public async getAll(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const cities = await this.getAllCities.execute();
    reply.send(cities);
  }
}
