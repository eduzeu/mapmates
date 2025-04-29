import axios from "axios";
import * as dotenv from 'dotenv';
import { ObjectId } from "mongodb";
import path from 'path';
import { fileURLToPath } from 'url';
import { users as usersCollection } from "../config/mongoCollections";
import { validateDate, validateObjectId, validateString, validateNumber } from "../helpers/validation";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const apiKey: string | undefined = process.env.API_KEY;


interface Feature {
  type: string;
  properties: {
    name: string;
    country: string;
    country_code: string;
    state: string;
    city: string;
    postcode: string;
    district: string;
    street: string;
    housenumber: string;
    formatted: string;
    categories: string[];
    details: string[];
    datasource: {
      sourcename: string;
      attribution: string;
      license: string;
      url: string;
      raw: {
        name: string;
        phone: string;
        osm_id: number;
        amenity: string;
        website: string;
        osm_type: string;
        addr: {
          city: string;
          street: string;
          housenumber: string;
          postcode: string;
          state: string;
        };
        opening_hours: string;
        cuisine?: string;
      };
    };
    website: string;
    opening_hours: string;
    contact: {
      phone: string;
    };
    place_id: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}


interface Restaurant {
  properties: {
    housenumber: string;
  };
}

interface Coordinates {
  latitude: number,
  longitude: number,
}

export const getCoordinates = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve(coordinates);
        },
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation not supported"));
    }
  });
}


export const getRestaurants = async () => {
  try {
    const response = await axios.get(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${apiKey}`);
    return response.data.features;
  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
  }
}

export const getAddedRestaurants = async () => {
  try {
    const users = await usersCollection();
    const newRestaurants = await users.find({
      visitedPlaces: { $exists: true, $ne: [] }
    });
    const restaurants = await newRestaurants.toArray();
    return restaurants;

  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
  }
}

export const getRestaurantsById = async (id: string) => {
  try {

    // id = validateObjectId(id);
    const response = await axios.get(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${apiKey}`);

    // console.log(response);
    const restaurant = response.data.features.find((rest: Restaurant) => rest.properties.housenumber === id);

    if (restaurant) {
      return restaurant.properties;
    } else {
      console.log("Restaurant not found");
      return null;
    }
  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
    return null;
  }
}
export const addRestaurant = async (name: string, type: string, visitDate: Date, id: string, lat: number, lon: number) => {
  try {
    console.log(name, type, visitDate, id, lat, lon);

    name = validateString(name);
    type = validateString(type);
    // visitDate = validateDate(visitDate);
    id = validateObjectId(id);
    lat = validateNumber(lat);
    lon = validateNumber(lon);
    // const coordinates = await getCoordinates();
    //now insert into mongo
    const users = await usersCollection();

    let object = {
      place: name,
      cuisine: type,
      visitedAt: visitDate,
      coordinates: { latitude: lat, longitude: lon },

    }

    const newPlace = await users.updateOne(
      { _id: new ObjectId(id) },
      { $push: { visitedPlaces: object } }
    );

    return newPlace

  } catch (e: unknown) {
    const error = e as Error;
    console.error("error adding restaurant: ", error.message);
    return null;
  }
}


export const deleteRestaurant = async (id: string, name: string) => {
  try {
    id = validateObjectId(id);
    name = validateString(name);

    const users = await usersCollection();

    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return { error: "User not found" };
    }

    const placeExists = user.visitedPlaces.some((place: any) => place.place === name);

    if (!placeExists) {
      return { error: `Place ${name} not found in visitedPlaces` };
    }

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { visitedPlaces: { place: name } } }
    );

    console.log(result);

    if (result.modifiedCount > 0) {
      return { message: `Place ${name} successfully deleted from visitedPlaces` };
    } else {
      return { error: "Failed to delete the place" };
    }

  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
    return { error: error.message };
  }
};


export const searchRestaurants = async (type: string) => {
  try {
    type = validateString(type);

    const response = await axios.get<{ features: Feature[] }>(
      `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${apiKey}`
    );

    const data = response.data;
    let matches: any[] = [];

    // filter from Geoapify API based on cuisine
    data.features.forEach((res: Feature) => {
      const cuisineFromProperties = res.properties.datasource.raw?.cuisine?.toLowerCase();
      console.log(cuisineFromProperties); // Optional: debug cuisine types
      if (cuisineFromProperties && cuisineFromProperties === type.toLowerCase()) {
        matches.push({
          ...res,
          source: "api"
        });
      }
    });

    //filter from MongoDB users visitedPlaces
    const users = await usersCollection();

    const usersWithMatchingCuisine = await users.find({
      "visitedPlaces.cuisine": type
    }).toArray();

    usersWithMatchingCuisine.forEach(user => {
      const matchedPlaces = user.visitedPlaces.filter((place: any) => place.cuisine === type);
      matchedPlaces.forEach(place => {
        matches.push({
          ...place,
          source: "mongo",
          userId: user._id
        });
      });
    });

    return matches;

  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
    return null;
  }
};


// (async () => {
//   const result = await searchRestaurants("chinese");
//   console.log(result);
// })();

export const restaurantExists = async (id: string): Promise<boolean> => {
  let restaurant = await getRestaurantsById(id);
  return restaurant !== null;
}