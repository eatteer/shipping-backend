import { Type } from "@sinclair/typebox";

/**
 * Schema for a City entity response.
 * Used to validate and document city data returned by the API.
 *
 * @example
 * ```json
 * {
 *   "id": "city-123",
 *   "name": "Springfield",
 *   "departmentId": "dept-1",
 *   "zoneId": "zone-2",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-02T00:00:00.000Z"
 * }
 * ```
 */
export const CITY_RESPONSE_SCHEMA = Type.Object({
    id: Type.String({ example: "city-123" }),
    name: Type.String({ example: "Springfield" }),
    departmentId: Type.String({ example: "dept-1" }),
    zoneId: Type.String({ example: "zone-2" }),
    createdAt: Type.String({ format: "date-time", example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: Type.String({ format: "date-time", example: "2024-01-02T00:00:00.000Z" }),
});

/**
 * Schema for an array of City entity responses.
 * Used to validate and document lists of cities returned by the API.
 *
 * @example
 * ```json
 * [
 *   {
 *     "id": "city-123",
 *     "name": "Springfield",
 *     "departmentId": "dept-1",
 *     "zoneId": "zone-2",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-02T00:00:00.000Z"
 *   }
 * ]
 * ```
 */
export const CITY_ARRAY_RESPONSE_SCHEMA = Type.Array(CITY_RESPONSE_SCHEMA);