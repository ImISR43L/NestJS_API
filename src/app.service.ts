// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Provides a simple health check response.
   * This is used by the AppController for the public /api/health endpoint.
   * @returns A success message string.
   */
  healthCheck(): string {
    return 'OK';
  }
}
