import { User } from "@domain/entities/user";
import { UserRepository } from "@domain/repositories/user-repository";
import { PostgresDb } from "@fastify/postgres";
import { PoolClient } from "pg";

export class PostgresUserRepository implements UserRepository {
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToUser(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  public async findById(id: string): Promise<User | null> {
    const result = await this.pg.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const result = await this.pg.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    return result.rows.length ? this.mapRowToUser(result.rows[0]) : null;
  }

  public async save(user: User): Promise<void> {
    let client: PoolClient | null = null;

    try {
      client = await this.pg.connect();

      await client.query("BEGIN");

      const query = `
        INSERT INTO users (id, email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5);
      `;

      await client.query(query, [
        user.id,
        user.email,
        user.passwordHash,
        user.createdAt,
        user.updatedAt,
      ]);

      await client.query("COMMIT");
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK");
      }

      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  public async update(user: User): Promise<void> {
    let client: PoolClient | null = null;

    try {
      client = await this.pg.connect();

      await client.query("BEGIN");

      const query = `
        UPDATE users
        SET email = $1, password_hash = $2, updated_at = $3
        WHERE id = $4;
      `;

      await client.query(query, [
        user.email,
        user.passwordHash,
        user.updatedAt,
        user.id,
      ]);

      await client.query("COMMIT");
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK");
      }

      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
