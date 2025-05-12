import express, { Router } from "express";
import xss from "xss";
import { addRestaurant, deleteRestaurant, getAddedRestaurants, getRestaurants, getRestaurantsById, searchRestaurantsByType, updateRestaurant } from "../data/restaurants";
import { checkForCached, clearKey, restaurantKey, setJsonList } from "../helpers/redis.ts";
import { validateCoordinates, validateDateString, validateObjectId, validateString } from "../helpers/validation";

const router = Router();

router.route("/")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      if (await checkForCached(restaurantKey, res)) return;

      const [apiRestaurants, addedRestaurants] = await Promise.all([
        getRestaurants(),
        getAddedRestaurants()
      ]);
      const allRestaurants = [...apiRestaurants, ...addedRestaurants];

      await setJsonList(restaurantKey, allRestaurants, 3600);

      res.status(200).json(allRestaurants);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/:id")
  .get(async (req: express.Request, res: express.Response) => {
    let id = req.params.id;

    try {
      id = validateString(id, "Restaurant Id");

    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    try {
      if (await checkForCached(id, res)) return;

      const getRestbyId = await getRestaurantsById(id);
      res.status(200).json(getRestbyId);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/search")
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "Recieved no information." });
      return;
    }

    let type = req.body.type;

    try {
      type = validateString(type, "Restaurant Type");

    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    type = xss(type);

    try {
      if (await checkForCached(type, res)) return;

      const findRests = await searchRestaurantsByType(type);
      res.status(200).json(findRests);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/add")
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "Recieved no information." });
      return;
    }

    let name = req.body.name;
    let type = req.body.type;
    let visitDate = req.body.visitedAt;
    let id = req.body.id;
    const lat = req.body.coordinates.lat;
    const lon = req.body.coordinates.long;
    let coords: {lat: number, lon: number};

    try {
      name = validateString(name, "Restaurant Name");
      type = validateString(type, "Restaurant Type");
      visitDate = validateDateString(visitDate, "Visit Date");
      id = validateObjectId(id, "User Id");
      coords = validateCoordinates({lat, lon}, "Coordinates");

    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    name = xss(name);
    type = xss(type);

    try {
      const findRests = await addRestaurant(name, type, visitDate, id, coords.lat, coords.lon);
      await clearKey(restaurantKey);
      res.status(200).json(findRests);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

router.route("/update")
  .put(async (req: express.Request, res: express.Response) => {
    let id = req.body.id;
    let name = req.body.name;
    let date = req.body.visitedAt;

    try {
      id = validateObjectId(id, "User Id");
      name = validateString(name, "Restaurant Name");
      date = validateDateString(date, "Visit Date");

    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    name = xss(name);

    try {
      const updateRest = await updateRestaurant(id, date, name);
      await clearKey(restaurantKey);

      if (updateRest === null) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
      }

      res.status(200).json(updateRest);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }
  );

router.route("/delete")
  .delete(async (req: express.Request, res: express.Response) => {
    let id = req.body.id;
    let name = req.body.name;

    try {
      id = validateObjectId(id, "User Id");
      name = validateString(name, "Restaurant Name");

    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    name = xss(name);

    try {
      const delRest = await deleteRestaurant(id, name);

      if (delRest === null) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
      }

      await clearKey(restaurantKey);

      res.status(200).json(delRest);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  })

export default router;