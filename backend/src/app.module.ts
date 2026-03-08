import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';

// Import des modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { StrategiesModule } from './strategies/strategies.module';
import { SwotModule } from './swot/swot.module';
import { ContentModule } from './content/content.module';
import { CalendarModule } from './calendar/calendar.module';
import { NotificationsModule } from './notifications/notifications.module';

// Guards globaux
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration globale des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // Configuration MongoDB avec variables d'environnement
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/marketplan-ia',
        retryWrites: true,
        w: 'majority',
        // Options de connexion modernes
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Forcer IPv4
      }),
    }),

    ScheduleModule.forRoot(),

    // Modules de l'application
    AuthModule,
    UsersModule,
    AiModule,
    StrategiesModule,
    SwotModule,
    ContentModule,
    CalendarModule,
    NotificationsModule,
  ],

  controllers: [AppController, HealthController],

  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
