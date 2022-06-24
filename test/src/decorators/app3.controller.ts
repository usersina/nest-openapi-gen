import { Controller, Get, Param } from "@nestjs/common";

@Controller(":projectName/event-timeline")
export class App3Controller {
  @Get(":storeId")
  getHello(@Param("projectName") p: string, @Param("storeId") storeId: string) {}
}
