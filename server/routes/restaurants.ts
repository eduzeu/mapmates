import express, { Router } from "express";
import { getRestaurants, getRestaurantsById, searchRestaurants, addRestaurant, deleteRestaurant } from "../data/restaurants.ts";

const router = Router();

router.route("/")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const getRest = await getRestaurants();
      res.status(200).json(getRest);
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
      const getRestbyId = await getRestaurantsById(id);
      res.status(200).json(getRestbyId);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/search")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const type: string = req.body.type;
      const findRests = await searchRestaurants(type);
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
      const name: string = req.body.name;
      const type: string = req.body.type;
      const visitDate: Date = req.body.visitDate;
      const id: string = req.body.id;
      const findRests = await addRestaurant(name, type, visitDate, id);

      res.status(200).json(findRests);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
router.route("/delete")
  .delete(async (req: express.Request, res: express.Response) => {
    try {
      const id: string = req.body._id;
      const name: string = req.body.name;

      const delRest = deleteRestaurant(id, name);
      res.status(200).json(delRest);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  })

export default router;