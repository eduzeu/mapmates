// Place helper functions here
import axios from "axios";
import { ObjectId } from "mongodb";
import * as uuid from 'uuid';

export const validateEmailAddress = (email, emailName) => {
  email = validateString(email, emailName);

  // regex source: https://www.geeksforgeeks.org/javascript-program-to-validate-an-email-address/
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!regex.test(email)) {
      throw `${emailName || "Provided string"} is not a valid email address.`
  }
  return email;
}

export const validatePassword = (password, passwordName) => {
  password = validateString(password, passwordName);

  if (password.length < 8) {
    throw "Password must be at least 8 characters long."
  }

  const lowerRegex = /[a-z]+/g;
  if (!lowerRegex.test(password)) {
    throw "Password must contain at least one lowercase letter."
  }

  const upperRegex = /[A-Z]+/g;
  if (!upperRegex.test(password)) {
    throw "Password must contain at least one uppercase letter."
  }

  const symbolRegex = /[^A-Za-z0-9]+/g;
  if (!symbolRegex.test(password)) {
    throw "Password must contain at least one symbol."
  }

  return password;
}

export const validateString = (str, strName) => {
  if (typeof str === "undefined")
    throw `${strName || "Provided parameter"} was not supplied.`;

  if (!str)
    throw `${strName || "Provided parameter"} was not supplied.`;

  if (typeof str !== "string")
    throw `${strName || "Provided data"} is not a string'.`;

  if (str.trim().length === 0)
    throw `${strName || "Provided string"} consists of only spaces.`;

  return str.trim();
}

export const validateDate = (date, dateName) => {
  if (Object.prototype.toString.call(date) !== "[object Date]")
    throw `${dateName || "Provided data"} is not a date.`

  if (isNaN(date))
    throw `${dateName || "Provided data"} is an invalid date.`

  return date;
}

export const validateObjectId = (id, idName) => {
  if (!ObjectId.isValid(id))
    throw `${idName || "Provided data"} is not a valid ObjectId.`
}

export const validateUUID = (id, idName) => {
  id = validateString(id, idName);

  if (!uuid.validate(id))
    throw `${idName || "Provided data"} is not a valid UUID.`

  return id;
}
