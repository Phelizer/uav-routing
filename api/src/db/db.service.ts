import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

// TODO: refactor completely
@Injectable()
export class DBService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      // extract configurations to env (might already exist btw)
      user: 'admin',
      host: 'localhost',
      database: 'uav-routing-postgres',
      password: '1111',
      port: 5433,
    });
    try {
      await this.pool.connect();
      // const dropRes = await this.runQuery(`
      //   DROP SCHEMA public CASCADE;
      //   CREATE SCHEMA public;
      //   GRANT ALL ON SCHEMA public TO public;
      // `);

      // console.log({ dropRes });

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          password VARCHAR(100) NOT NULL,
          roles VARCHAR(50)[],
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS solutions (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          fitness DOUBLE PRECISION,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS points (
            id SERIAL PRIMARY KEY,
            domain_id INT,
            solution_id INT REFERENCES solutions(id),
            lat DOUBLE PRECISION,
            lng DOUBLE PRECISION,
            isBase BOOLEAN,
            isStartBase BOOLEAN,
            label text,
            sequence_number INT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS experiments (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          numberOfPoints INT,
          numberOfRuns INT,
          algorithm VARCHAR(4),
          params JSONB,
          mean DOUBLE PRECISION,
          standardDeviation DOUBLE PRECISION,
          created_at TIMESTAMP DEFAULT NOW()
        );

      `);

      await this.runQuery(`
        INSERT INTO users (username, password, roles)
        VALUES ('researcher', '1111', ARRAY['researcher']), ('user', '1111', ARRAY['user']);
      `);

      await this.runQuery(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log('Connected to the database.');
    } catch (err) {
      console.error('Error connecting to the database.', err);
    }
  }

  async runQuery(query: string, values?: unknown[]) {
    const client = await this.pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      try {
        res = await client.query(query, values);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    } finally {
      client.release();
    }
    return res;
  }
}
