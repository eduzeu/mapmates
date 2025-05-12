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
  if (!obj) throw `${objName || "Provided data"} was not supplied.`;

  if (typeof obj !== "object")
    throw `${objName || "Provided data"} is not an object.`;

  if (Array.isArray(obj)) throw `${objName || "Provided object"} is an array.`;

  if (Object.keys(obj).length === 0)
    throw `${objName || "Provided object"} is empty.`;

  return obj;
};

export const validateReviewImage = (image, imageName) => {
  console.log(image);
  image = validateObject(image, imageName);

  image.altText = validateString(image.altText, "Image Alt Text");
  image.imageUrl = validateCloudinaryUrl(image.imageUrl, "Image URL");

  return image;
};
