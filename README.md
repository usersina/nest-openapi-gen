# nest-openapi-gen

Automatically generate OpenAPI documentation from your NestJS controllers without overhead.

## Problem 😕

You already defined your controllers with typescript, and you don't want to write it again in the open API document, or add the `@ApiProperty()` decorator anywhere.

## Solution 😄

This package can generate the openapi document without adding any code or decorators.

## Usage

### Install

`npm i -D nest-openapi-gen`

### Generate

```typescript
import { generate } from "nest-openapi-gen";
generate({ prefix: "/api" });
```

This will generate openapi.schema.json file in the root folder.

### Options

- prefix - global prefix
- filePath - The path to the generated file
- tsConfigFilePath - tsconfig.json file path. default - [root].tsconfig.json

### Decorators

#### Validation decorators

- Min
- Max
- Pattern
- Date
- Time
- DateTime
- Duration
- Uri
- UriReference
- UriTemplate
- Email
- Hostname
- Ipv4
- Ipv6
- Regex
- Uuid
- JsonPointer
- RelativeJsonPointer
- NumberString

examples

```typescript
class FormatClass {
  @Uuid uuid: string;
}

class MinMaxClass {
  @Min(1) from: number;
  @Max(5) to: number;

  @Min(1) array: string[];

  @Min(1) object: { a: number };
}

@Controller("")
export class App3Controller {
  @Post("format/:mail")
  format(@Param("mail") @Email mail: string, @Query() query: FormatClass, @Body() body: FormatClass) {}

  @Post("minmax/:mail")
  minmax(@Param("mail") @Min(5) @Email mail: string, @Query() query: MinMaxClass, @Body() body: MinMaxClass) {}
}
```

#### Schema decorator

You can set openapi schema by using Schema decorator.

```typescript
  @Post("schema/:mail")
  schema(
    @Param("mail") @Schema({ description: "User email" }) @Email mail: string,
    @Query() @Schema({ properties: { someInt: { type: "integer" } } }) query: SomeInterfaceWithInt
  ) {}
```

## Big advantage

Now that we have openapi doc, we can use [express-openapi-validator](https://www.npmjs.com/package/express-openapi-validator) instead of class-validator.

This ugly code:

```typescript
export class GetEventsTimelineParams {
  // eslint-disable-next-line no-restricted-syntax
  @IsString() projectName!: string;
  // eslint-disable-next-line no-restricted-syntax
  @IsNumber() storeId!: number;
}

export class GetEventsTimelineQuery {
  // eslint-disable-next-line no-restricted-syntax
  @IsString() uuid!: string;
  // eslint-disable-next-line no-restricted-syntax
  @IsNumber() startTime!: number;
  @IsNumber() @IsOptional() endTime?: number;
}
@Controller(":projectName/event-timeline")
export class EventTimelineController {
  @Get(":storeId")
  getEventTimeline(@Param() params: GetEventsTimelineParams, @Query() query: GetEventsTimelineQuery): Promise<ActivityTimeline[]> {}
}
```

Becomes this:

```typescript
export interface GetEventsTimelineQuery {
  uuid: string;
  startTime: number;
  endTime?: number;
}

@Controller(":projectName/event-timeline")
export class EventTimelineController {
  @Get(":storeId")
  getEventTimeline(
    @Param("projectName") projectName: string,
    @Param("storeId") storeId: number,
    @Query() query: GetEventsTimelineQuery
  ): Promise<ActivityTimeline[]> {}
}
```

## Development

It is best that you directly see the changes in a live project when working on this package.
To do that, you have to build this package whenever you make changes to it.
For the local development, youse the `examples/the-smart-way` project to see the changes to your specifications.

This can be done by running the following commands: (paths are specified to the left of each command)

- `(nest-openapi-gen) $ npm run build:watch` - watch this package's build
- `(nest-openapi-gen/examples/the-smart-way) $ npm run start:dev:package` - start the main project with auto-restart

You can then access `http://localhost:3000/docs` to see the changes in Swagger UI.

## TODO

- [ ] Add [nullable](https://swagger.io/docs/specification/v3_0/data-models/data-types/#null) support
- [ ] Implement CI/CD pipeline
- [ ] Create CLI commands
- [ ] Handle multiple response types
- [ ] Support file uploads in requests and responses
- [ ] Add additional decorators

## Dependencies

- [ts-morph](https://www.npmjs.com/package/ts-morph) - TypeScript Compiler API wrapper to parse your types to openapi schemas.

## References

- [Swagger Editor](https://editor.swagger.io/)
- OpenAPI [specification](https://swagger.io/specification/)
