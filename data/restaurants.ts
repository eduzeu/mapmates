import axios from "axios";
import * as dotenv from 'dotenv';
dotenv.config();

const key = process.env.API_KEY;

interface Restaurant {
  properties: {
    housenumber: string;
  };
}

export const getRestaurants = async () => {
  try {
    const response = await axios.get(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${key}`);
    return response.data;
  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
  }
}

export const getRestaurantsById = async (id: string) => {
  try {
    const response = await axios.get(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${key}`);

    console.log(response);
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

// (async () => {
//   const result = await getRestaurantsById("61");
//   console.log(result);
// })();