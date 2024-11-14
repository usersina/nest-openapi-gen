import { Controller, Get, Param, Query } from "@nestjs/common";
import { Min } from "nest-openapi-gen/decorators";

/**
 * The Event interface is used to describe an event.
 */
interface Event {
  id: number;
  type: EventType;
  /**
   * The timestamp of the event.
   */
  timestamp: number;
  locationId: number;
  /**
   * Whether the event can be undefined. Should not be required.
   */
  canBeUndefined?: string;
  canBeNull: string | null;
  nullableEvent: Event | null;
  nonNullableEvents: Event[];
}

/**
 * The EventType enum is used to specify the type of an event.
 */
enum EventType {
  SYSTEM = "system",
  USER = "user",
}

/**
 * This is a description of the EventsController class and it should appear as a
 * summary in the OpenAPI documentation.
 */
@Controller("events")
export class EventsController {
  /**
   * This is a description of the getEvents methods and it should also be
   * included in the OpenAPI documentation.
   */
  @Get(":locationId")
  getEvents(
    /**
     * Description of the locationId parameter.
     */
    @Param("locationId") @Min(100) locationId: number,
    /**
     * Description of the ids query parameter.
     */
    @Query("ids") @Min(2) ids?: number[],
    /**
     * Description of the type query parameter.
     */
    @Query("type") type?: EventType
  ): Promise<Event[]> {
    return new Promise((resolve) => resolve([]));
  }
}
