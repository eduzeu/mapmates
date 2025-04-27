import express, { Router } from "express";
import { getRestaurants, getRestaurantsById, searchRestaurants, addRestaurant, deleteRestaurant } from "../data/restaurants";
import { validateObjectId, validateDateString, validateDate, validateEmailAddress, validatePassword, validateString } from "../helpers/validation";
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
      const parsedVisitDate = new Date(req.body.visitDate);
      const name: string = req.body.name;
      const type: string = req.body.type;
      const visitDate: Date = parsedVisitDate;
      const id: string = req.body.id;
      validateString(name, "Restaurant Name");
      validateString(type, "Restaurant Type");
      validateDate(visitDate, "Visit Date");
      // validateObjectId(id, "User Id");
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