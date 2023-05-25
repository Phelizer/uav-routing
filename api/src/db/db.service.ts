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
      port: 5432,
    });
    try {
      await this.pool.connect();
      console.log('Connected to the database.');
    } catch (err) {
      console.error('Error connecting to the database.', err);
    }
  }

  async runQuery(query: string) {
    const client = await this.pool.connect();
    let res;
    try {
      await client.query('BEGIN');
      try {
        res = await client.query(query);
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
