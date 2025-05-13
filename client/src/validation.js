export const validateString = (str, strName) => {
  if (typeof str === "undefined")
    throw new Error(`${strName || "Provided parameter"} was not supplied.`);

  if (!str)
    throw new Error(`${strName || "Provided parameter"} is an empty string.`);

  if (typeof str !== "string")
    throw new Error(`${strName || "Provided data"} is not a string.`);

  if (str.trim().length === 0)
    throw new Error(`${strName || "Provided string"} is empty.`);

  return str.trim();
};

export const validateObjectId = (id, idName) => {
  id = validateString(id, idName);

  const objectIdRegex = /^[a-f\d]{24}$/i;
  if (!objectIdRegex.test(id))
    throw `${idName || "Provided string"} is not a valid ObjectId.`;

  return id;
};

export const validateCloudinaryUrl = (url, urlName) => {
  url = validateString(url, urlName);

  let path =
    /^http:\/\/res\.cloudinary\.com\/dcvqjizwy\/image\/upload\/v[0-9]+\/[a-z0-9]+/m;
  if (!path.test(url)) {
    throw new Error(
      `${urlName || "Provided string"} is not a valid image url.`
    );
  }

  let fileExt = /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/im;
  if (!fileExt.test(url)) {
    throw new Error(
      `${urlName || "Provided string"} is not a valid image url.`
    );
  }

  return url;
};

const validateObject = (obj, objName) => {
  if (!obj) throw new Error(`${objName || "Provided data"} was not supplied.`);

  if (typeof obj !== "object")
    throw new Error(`${objName || "Provided data"} is not an object.`);

  if (Array.isArray(obj)) throw new Error(`${objName || "Provided object"} is an array.`);

  if (Object.keys(obj).length === 0)
    throw new Error(`${objName || "Provided object"} is empty.`);

  return obj;
};

export const validateReviewImage = (image, imageName) => {
  console.log(image);
  image = validateObject(image, imageName);

  image.altText = validateString(image.altText, "Image Alt Text");
  image.imageUrl = validateCloudinaryUrl(image.imageUrl, "Image URL");

  return image;
};

export const validateNumber = (num, numName) => {
  if (typeof num === "undefined")
    throw new Error(
      `${numName || "Provided parameter"} was not supplied.`
    );

  if (typeof num !== "number")
    throw new Error(
      `${
        numName || "Provided data"
      } is not of type 'number', but of type '${typeof num}'.`
    );

  if (isNaN(num))
    throw new Error(`${numName || "Provided number"} is NaN.`);

  return num;
};

export const validatePageNumber = (page, pageName) => {
  page = validateNumber(page, pageName);

  if (page < 1)
    throw new Error("Page must be at least 1.");

  return page;
}

export const validateEmailAddress = (email, emailName) => {
  email = validateString(email, emailName);

  // Based on regex in https://www.npmjs.com/package/email-validator?activeTab=code (see index.js)
  // Modified to meet spec requirements
  const regex =
    /^(((\\@)?[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~]((\.?|\\@?)[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*)|(\"([-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~\s])*\"))@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!regex.test(email)) {
    throw new Error(
      `${emailName || "Provided string"} is not a valid email address.`
    );
  }
  return email;
};

export const validatePassword = (password, passwordName) => {
  password = validateString(password, passwordName);

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const lowerRegex = /[a-z]+/g;
  if (!lowerRegex.test(password)) {
    throw new Error(
      "Password must contain at least one lowercase letter."
    );
  }

  const upperRegex = /[A-Z]+/g;
  if (!upperRegex.test(password)) {
    throw new Error(
      "Password must contain at least one uppercase letter."
    );
  }

  const symbolRegex = /[^A-Za-z0-9]+/g;
  if (!symbolRegex.test(password)) {
    throw new Error("Password must contain at least one symbol.");
  }

  return password;
};

export const validateCuisine = (cuisine, cuisineName) => {
  cuisine = validateString(cuisine, cuisineName).toLowerCase();

  const options = ["mexican", "indian", "chinese", "italian", "cuban", "vietnamese"]

  if (!options.includes(cuisine)) {
    throw new Error(
      `${cuisineName || "Provided string"} is not a valid cuisine.`
    );
  }

  return cuisine;
}