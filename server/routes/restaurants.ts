import { Router } from "express";
import { getRestaurants, getRestaurantsById, searchRestaurants, addRestaurant, deleteRestaurant } from "../data/restaurants";
import { Request, Response } from "express";

const router = Router();

router.route("/")
  .get(async (req: Request, res: Response) => {
    try {
      const getRest = await getRestaurants();
      return res.status(200).json(getRest);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  });
router.route("/:id")
  .get(async (req: Request, res: Response) => {
    try {
      const id: string = req.params.id;
      const getRestbyId = await getRestaurantsById(id);
      return res.status(200).json(getRestbyId);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  });
router.route("/search")
  .get(async (req: Request, res: Response) => {
    try {
      const type: string = req.body.type;
      const findRests = await searchRestaurants(type);
      return res.status(200).json(findRests);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  });
router.route("/add")
  .post(async (req: Request, res: Response) => {
    try {
      const name: string = req.body.name;
      const type: string = req.body.type;
      const visitDate: Date = req.body.visitDate;
      const id: string = req.body.id;
      const findRests = await addRestaurant(name, type, visitDate, id);

      return res.status(200).json(findRests);
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  });
router.route("/delete")
  .delete(async (req: Request, res: Response) => {
    try {
      const id: string = req.body._id;
      const name: string = req.body.name;

      const delRest = deleteRestaurant(id, name);
      return res.status(200).json(delRest);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  })

export default router;