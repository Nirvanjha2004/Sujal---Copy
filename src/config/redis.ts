import { createClient, RedisClientType } from 'redis';
import config from './index';

class RedisConnection {
  private static instance: RedisConnection;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis: Too many reconnection attempts, giving up');
            return new Error('Too many reconnection attempts');
          }
          const delay = Math.min(retries * 50, 500);
          console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
          return delay;
        },
      },
      password: config.redis.password,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('🔄 Redis: Connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis: Connection ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis: Connection error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Redis: Connection ended');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
      this.isConnected = false;
    });
  }

  public async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('❌ Redis: Failed to connect:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      console.error('❌ Redis: Failed to disconnect:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  // Cache operations with error handling
  public async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number }
  ): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis: Not connected, skipping SET operation');
        return false;
      }
      await this.client.set(key, value, options);
      return true;
    } catch (error) {
      console.error('❌ Redis: SET operation failed:', error);
      return false;
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis: Not connected, skipping GET operation');
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      console.error('❌ Redis: GET operation failed:', error);
      return null;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis: Not connected, skipping DEL operation');
        return false;
      }
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('❌ Redis: DEL operation failed:', error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis: Not connected, skipping EXISTS operation');
        return false;
      }
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis: EXISTS operation failed:', error);
      return false;
    }
  }

  public async setEx(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis: Not connected, skipping SETEX operation');
        return false;
      }
      await this.client.setEx(key, seconds, value);
      return true;
    } catch (error) {
      console.error('❌ Redis: SETEX operation failed:', error);
      return false;
    }
  }
}

export default RedisConnection;