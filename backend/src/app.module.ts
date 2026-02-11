import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import du module d'authentification
import { AuthModule } from '../modules/auth.module';

// Guards globaux
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AccountActiveGuard } from '../guards/plan.guard';

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
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/marketplan-ia',
        retryWrites: true,
        w: 'majority',
        // Options de connexion
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
      }),
    }),

    // Module d'authentification
    AuthModule,
  ],

  controllers: [AppController],
  
  providers: [
    AppService,

    // Appliquer JwtAuthGuard globalement (sauf routes @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Appliquer AccountActiveGuard globalement
    {
      provide: APP_GUARD,
      useClass: AccountActiveGuard,
    },
  ],
})
export class AppModule {}
