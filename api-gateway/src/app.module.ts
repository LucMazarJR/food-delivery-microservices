import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/src.guard';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DeliveryModule } from './delivery/delivery.module';
import { OrdersModule } from './orders/orders.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PaymentModule } from './payment/payment.module';
import { MenuModule } from './menu/menu.module';
import { TrackingModule } from './tracking/tracking.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrometheusModule.register({
      controller: MetricsController,
      defaultMetrics: { enabled: true },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRATION_TIME) },
    }),
    AuthModule,
    UserModule,
    DeliveryModule,
    OrdersModule,
    RestaurantModule,
    PaymentModule,
    MenuModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
