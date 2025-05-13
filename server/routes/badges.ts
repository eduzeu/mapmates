import express, { Router } from "express";
import { earnFriendBadge, earnReviewBadge, getFriendBadges, getReviewBadges } from "../data/badges";
import { validateObjectId } from "../helpers/validation";

const router = Router();

router.route("/:id")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const id = req.params.id;
      const userId = validateObjectId(id, "User ID");
      //get only friend badges
      const friendBadges = await getFriendBadges(userId);
      //get only review badges
      const reviewBadges = await getReviewBadges(userId);
      //combine both badges
      const badges = [...friendBadges, ...reviewBadges];
      console.log("result", (badges));
      res.status(200).json(badges)
      return;

    } catch (e: unknown) {
      const error = e as Error;
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  });
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