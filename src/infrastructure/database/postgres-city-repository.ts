import { City } from "@domain/entities/city";
import { CityRepository } from "@domain/repositories/city-repository";
import { PostgresDb } from "@fastify/postgres";

export class PostgresCityRepository implements CityRepository {
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToCity(row: any): City {
    return new City({
      id: row.id,
      name: row.name,
      departmentId: row.department_id,
      zoneId: row.zone_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findById(id: string): Promise<City | null> {
    const result = await this.pg.query("SELECT * FROM cities WHERE id = $1", [
      id,
    ]);

    return result.rows.length ? this.mapRowToCity(result.rows[0]) : null;
  }

  async findAll(): Promise<City[]> {
    const result = await this.pg.query("SELECT * FROM cities ORDER BY name");
    return result.rows.map(this.mapRowToCity);
  }
}
