import express from "express";
import { createClient } from 'redis';
import { ServerError } from "./errors.ts";

const client = createClient();

await client.connect();

export const restaurantKey = "restaurants";

export const reviewKey = (name: string): string => {
  return `review:${name}`;
}

export const setJson = async (key: string, value: any, expiration: number) => {
  key = key.toLowerCase();

  try {
    await client.json.set(key, "$", value);
    if (expiration) await client.expire(key, expiration);
  } catch (e) {
    const error = e as Error;
    throw new ServerError(error.toString());
  }
};

export async function getJson(key: string): Promise<any | null> {
  key = key.toLowerCase();

  const exists = await client.exists(key);
  if (!exists) return null;

  try {
    const value = await client.json.get(key);
    return value;

  } catch (e) {
    const error = e as Error;
    throw new ServerError(error.toString());
  }
}

export const setJsonList = async (key: string, value: any, expiration: number) => {
  key = key.toLowerCase();

  try {
    await client.json.set(key, "$", value);
    if (expiration) await client.expire(key, expiration);
  } catch (e) {
    const error = e as Error;
    throw new ServerError(error.toString());
  }
};

export const clearKey = async (key: string) => {
  key = key.toLowerCase();

  try {
    const exists = await client.exists(key);
    if (!exists) return;

    await client.json.del(key, "$");
  } catch (e) {
    const error = e as Error;
    throw new ServerError(error.toString());
  }
};

export const checkForCached = async (key: string, res: express.Response) => {
  const cached = await getJson(key);

  if (cached) {
    res.status(200).json(cached);
    return true;
  }

  return false;
}
