import express, { Router } from "express";
import { earnFriendBadge, earnReviewBadge } from "../data/badges";
import { validateString } from "../helpers/validation";

const router = Router();

router.route("/friend/:id")
  .post(async (req: express.Request, res: express.Response) => {
    try {
      const id: string = req.params.id;
      validateString(id, "User ID");
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
    try {
      const id: string = req.params.id;
      validateString(id, "User ID");
      const revBadge = await earnReviewBadge(id);
      res.status(200).json(revBadge);

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }
  );


export default router;