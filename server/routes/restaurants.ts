import express, { Router } from "express";
import { addRestaurant, deleteRestaurant, getAddedRestaurants, getRestaurants, getRestaurantsById, searchRestaurantsByType, updateRestaurant } from "../data/restaurants";
import { validateObjectId, validateString } from "../helpers/validation";
const router = Router();

router.route("/")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const [apiRestaurants, addedRestaurants] = await Promise.all([
        getRestaurants(),
        getAddedRestaurants()
      ]);
      const allRestaurants = [...apiRestaurants, ...addedRestaurants];
      res.status(200).json(allRestaurants);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/:id")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const id: string = req.params.id;
      validateObjectId(id, "Restaurant Id");
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
    try {
      const type: string = req.body.type;
      validateString(type, "Restaurant Type");
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
    try {
      console.log(req.body)
      const name: string = req.body.name;
      const type: string = req.body.type;
      const visitDate: Date = req.body.visitedAt;
      const id: string = req.body.id;
      const lat: number = req.body.coordinates.lat;
      const lon: number = req.body.coordinates.long;
      validateString(name, "Restaurant Name");
      validateString(type, "Restaurant Type");
      // validateDate(visitDate, "Visit Date");
      // validateObjectId(id, "User Id");

      const findRests = await addRestaurant(name, type, visitDate, id, lat, lon);

      res.status(200).json(findRests);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

router.route("/update")
  .put(async (req: express.Request, res: express.Response) => {
    try {
      const id: string = req.body.id;
      const name: string = req.body.name;
      const date: Date = req.body.visitedAt;
      validateObjectId(id, "User Id");
      validateString(name, "Restaurant Name");
      // validateDate(date, "Visit Date");

      const updateRest = await updateRestaurant(id, date, name);

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
    try {
      const id: string = req.body.id;
      const name: string = req.body.name;
      validateObjectId(id, "User Id");
      validateString(name, "Restaurant Name");
      const delRest = await deleteRestaurant(id, name);

      if (delRest === null) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
      }

      res.status(200).json(delRest);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  })

export default router;