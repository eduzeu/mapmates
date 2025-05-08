import { isDate, isValid, parse, parseISO } from "date-fns";
import { ObjectId } from "mongodb";
import * as uuid from "uuid";
import { ValidationError } from "./errors";

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

export const validateDate = (date: any, dateName?: string): Date => {
  if (!isDate(date))
    throw new ValidationError(
      `${dateName || "Provided data"} is not a Date object.`
    );

  if (!isValid(date))
    throw new ValidationError(`${dateName || "Provided date"} is not a valid.`);

  return date;
};


export const validateDateString = (dateString: any, paramName?: string): string => {
  dateString = validateString(dateString, paramName);
  
  // Check if the date is valid
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${paramName} is not a valid date.`);
  }
  
  return dateString;
};
export const validateISOString = (date: any, dateName?: string): string => {
  date = validateString(date, dateName);

  const parsed = parseISO(date);
  if (!isValid(parsed))
    throw new ValidationError(
      `${dateName || "Provided string"} is not a valid date.`
    );

  return date;
};

export const validateEmailAddress = (
  email: any,
  emailName?: string
): string => {
  email = validateString(email, emailName);

  // Based on regex in https://www.npmjs.com/package/email-validator?activeTab=code (see index.js)
  // Modified to meet spec requirements
  const regex =
    /^(((\\@)?[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~]((\.?|\\@?)[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*)|(\"([-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~\s])*\"))@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!regex.test(email)) {
    throw new ValidationError(
      `${emailName || "Provided string"} is not a valid email address.`
    );
  }
  return email;
};

export const validatePassword = (
  password: any,
  passwordName?: string
): string => {
  password = validateString(password, passwordName);

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long.");
  }

  const lowerRegex = /[a-z]+/g;
  if (!lowerRegex.test(password)) {
    throw new ValidationError(
      "Password must contain at least one lowercase letter."
    );
  }

  const upperRegex = /[A-Z]+/g;
  if (!upperRegex.test(password)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter."
    );
  }

  const symbolRegex = /[^A-Za-z0-9]+/g;
  if (!symbolRegex.test(password)) {
    throw new ValidationError("Password must contain at least one symbol.");
  }

  return password;
};

export const validateUUID = (id: any, idName?: string): string => {
  id = validateString(id, idName);

  if (!uuid.validate(id))
    throw new ValidationError(
      `${idName || "Provided data"} is not a valid UUID.`
    );

  return id;
};

export const validateNumber = (num: any, numName?: string): number => {
  if (typeof num === "undefined")
    throw new ValidationError(
      `${numName || "Provided parameter"} was not supplied.`
    );

  if (typeof num !== "number")
    throw new ValidationError(
      `${
        numName || "Provided data"
      } is not of type 'number', but of type '${typeof num}'.`
    );

  if (isNaN(num))
    throw new ValidationError(`${numName || "Provided number"} is NaN.`);

  return num;
};

export const validateCloudinaryUrl = (url: any, urlName?: string) => {
  url = validateString(url, urlName);

  let path =
    /^http:\/\/res\.cloudinary\.com\/dcvqjizwy\/image\/upload\/v[0-9]+\/[a-z0-9]+/m;
  if (!path.test(url)) {
    throw new ValidationError(
      `${urlName || "Provided string"} is not a valid image url.`
    );
  }

  let fileExt = /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/im;
  if (!fileExt.test(url)) {
    throw new ValidationError(
      `${urlName || "Provided string"} is not a valid image url.`
    );
  }

  return url;
};


