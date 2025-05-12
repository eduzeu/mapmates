import express, { Router } from "express";
import { earnFriendBadge, earnReviewBadge } from "../data/badges";
import { validateObjectId } from "../helpers/validation";

const router = Router();

router.route("/friend/:id")
  .post(async (req: express.Request, res: express.Response) => {
    let id = req.params.id;

    try {
      id = validateObjectId(id, "User ID");

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    try {
      const friendBadge = await earnFriendBadge(id);
      res.status(200).json(friendBadge);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });

router.route("/review/:id")
  .post(async (req: express.Request, res: express.Response) => {
    let id = req.params.id;

    try {
      id = validateObjectId(id, "User ID");
      
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(400).json({ error: error.message });
      return;
    }

    try {
      const revBadge = await earnReviewBadge(id);
      res.status(200).json(revBadge);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });


export default router;