import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.API_KEY;



export const getRestaurants = async () => {
  try {
    const response = await axios.get(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:-74.028,40.743,1000&limit=20&apiKey=${key}`);

    return response.data;
  } catch (e: unknown) {
    const error = e as Error;
    console.error(error.message);
  }

}

