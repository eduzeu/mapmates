import express, { Router } from "express";
import { handleErrors } from "../helpers/errors.ts";
import { validateObjectId } from "../helpers/validation.ts";
import { getFeed, getUserFeed, getFriendsFeed } from "../data/feed.ts";

const router = Router();

// Get general feed (all posts)
router.route("/")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const feedData = await getFeed(page, limit);
      res.status(200).json(feedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

// Get feed for a specific user
router.route("/user/:id")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      let userId = req.params.id;
      validateObjectId(userId, "User ID");
      
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const userFeedData = await getUserFeed(userId, page, limit);
      res.status(200).json(userFeedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

// Get feed for a user and their friends
router.route("/friends/:id")
  .get(async (req: express.Request, res: express.Response) => {
    try {
      let userId = req.params.id;
      validateObjectId(userId, "User ID");
      
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const friendsFeedData = await getFriendsFeed(userId, page, limit);
      res.status(200).json(friendsFeedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

export default router;