import { EventEmitter } from "node:events";

export const noteEvents = new EventEmitter();

export type DataChangeEvent = {
  type: "note" | "folder";
  id: string;
  userId: string;
};
