import { Controller, Get, Param, Query } from "@nestjs/common";
import { Min } from "nest-openapi-gen/decorators";

interface Event {
  id: number;
  type: EventType;
  timestamp: number;
  locationId: number;
  canBeUndefined?: string;
  canBeNull: string | null;
  nullableEvent: Event | null;
  nonNullableEvents: Event[];
}

enum EventType {
  SYSTEM = "system",
  USER = "user",
}

@Controller("events")
export class EventsController {
  @Get(":locationId")
  getEvents(
    @Param("locationId") @Min(100) locationId: number,
    @Query("ids") @Min(2) ids?: number[],
    @Query("type") type?: EventType
  ): Promise<Event[]> {
    return new Promise((resolve) => resolve([]));
  }
}
