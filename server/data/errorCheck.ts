import { ObjectId } from "mongodb";


export const checkForId = (id: string) => {
  if (typeof id !== "string") {
    throw new Error("Id must be a string.");
  }
  if (id.trim().length === 0) {
    throw new Error("Id cannot be an empty string.");
  }
  if (!ObjectId.isValid(id)) {
    throw new Error("Id is not a valid ObjectId.");
  }
  return id.trim();
}

export const checkForName = (name: string) => {
  if (typeof name !== "string") {
    throw new Error("Name must be a string.");
  }
  if (name.trim().length === 0) {
    throw new Error("Name cannot be an empty string.");
  }
  return name.trim();
}

export const checkForType = (type: string) => {
  if (typeof type !== "string") {
    throw new Error("Type must be a string.");
  }
  if (type.trim().length === 0) {
    throw new Error("Type cannot be an empty string.");
  }
  return type.trim();
}

export const checkForDate = (date: Date) => {
  if (typeof date !== "object") {
    throw new Error("Date must be a Date object.");
  }
  if (isNaN(date.getTime())) {
    throw new Error("Date is not a valid Date object.");
  }
  return date;
}
