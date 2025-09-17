import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@hsuite/nestjs-swagger';

/**
 * Sets up Swagger (OpenAPI) for the NestJS application.
 * Centralizes API documentation configuration and UI setup.
 */
export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);

  const builder = new DocumentBuilder()
    .setTitle('Hsuite - Smart App')
    .setDescription(
      `Welcome to our Swagger Open API.</br>
If you are a developer, and you wish to interact with HSuite Smart Nodes from your own DAPP
please visit our <a href="https://github.com/HbarSuite/angular-sdk">Angular SDK</a>.</br>
Feel free to reach us out on our <a href="https://discord.gg/bHtu9AduNH">Discord</a>, we will be happy to onboard new developers.`
    )
    .setVersion('2.0')
    .addTag('HSuite', 'Enhancing the Hashgraph Network', {
      description: 'HSuite Documentation',
      url: 'https://docs.hsuite.finance',
    });

  const authenticationEnabled = configService.get<boolean>('authentication.enabled');
  if (authenticationEnabled) {
    builder
      .addBearerAuth(
        {
          type: 'http',
          name: 'Authorization',
          scheme: 'Bearer',
          bearerFormat: 'JWT',
          in: 'Header',
          description: 'JWT Authorization header using the Bearer scheme',
        },
        'Bearer'
      )
      .addSecurityRequirements('Bearer');
  }

  const document = SwaggerModule.createDocument(app, builder.build(), {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });
}


