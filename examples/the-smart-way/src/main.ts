import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { BadRequest } from "express-openapi-validator/dist/framework/types";
import { readFileSync } from "fs";
import { AppModule } from "./app.module";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error & { context?: any }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof BadRequest
        ? exception.status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      errors: (exception as BadRequest).errors,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());

  const document = JSON.parse(readFileSync("./openapi.json", { encoding: "utf-8" }));
  app.use(
    OpenApiValidator.middleware({
      apiSpec: document,
      ignoreUndocumented: true,
    })
  );
  SwaggerModule.setup("docs", app, document);
  await app.listen(3000);
}
bootstrap();
