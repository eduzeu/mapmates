import { ValidationError } from "./errors.ts";
import { ObjectId } from "mongodb";
import { parse, isValid } from "date-fns";

export const validateString = (str: any, strName?: string): string => {
  if (typeof str === "undefined")
    throw new ValidationError(
      `${strName || "Provided parameter"} was not supplied.`
    );

  if (!str)
    throw new ValidationError(
      `${
        strName || "Provided parameter"
      } is an empty string or evaluates to false.`
    );

  if (typeof str !== "string")
    throw new ValidationError(
      `${
        strName || "Provided data"
      } is not of type 'string', but of type '${typeof str}'.`
    );

  if (str.trim().length === 0)
    throw new ValidationError(
      `${strName || "Provided string"} consists of only spaces.`
    );

  return str.trim();
};

export const validateObjectId = (
  objectId: any,
  objectIdName?: string
): string => {
  objectId = validateString(objectId, objectIdName);

  if (!ObjectId.isValid(objectId))
    throw new ValidationError(
      `${objectIdName || "Provided string"} is not a valid Object ID.`
    );

  return objectId;
};

export const validateDateString = (date: any, dateName?: string): string => {
  date = validateString(date, dateName);

  const parsed = parse(date, "yyyy-MM-dd", new Date());
  if (!isValid(parsed))
    throw new ValidationError(
      `${dateName || "Provided string"} is not a valid date.`
    );

  return date;
};
