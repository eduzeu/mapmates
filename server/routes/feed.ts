import express, { Router } from "express";
import {
  getAllReviewsWithUserInfo,
  getFriendsReviewsWithInfo,
  getReviewsByUserWithInfo
} from "../data/feed.ts";
import { handleErrors } from "../helpers/errors.ts";
import { validateObjectId, validatePageLimitString, validatePageNumberString } from "../helpers/validation.ts";

const router = Router();

// Get general feed (all reviews)
router.route("/")
  .get(async (req: express.Request, res: express.Response) => {
    const page = validatePageNumberString(req.params.page ?? "1", "Page Number");
    const limit = validatePageLimitString(req.params.limit ?? "10", "Page Limit");

    try {
      const feedData = await getAllReviewsWithUserInfo(page, limit);
      res.status(200).json(feedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

// Get feed for a specific user
router.route("/user/:id")
  .get(async (req: express.Request, res: express.Response) => {
    const page = validatePageNumberString(req.params.page ?? "1", "Page Number");
    const limit = validatePageLimitString(req.params.limit ?? "10", "Page Limit");
    let userId = req.params.id;

    try {
      userId = validateObjectId(userId, "User Id");

    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      const userFeedData = await getReviewsByUserWithInfo(userId, page, limit);
      res.status(200).json(userFeedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

// Get feed for a user and their friends
router.route("/friends/:id")
  .get(async (req: express.Request, res: express.Response) => {
    const page = validatePageNumberString(req.params.page ?? "1", "Page Number");
    const limit = validatePageLimitString(req.params.limit ?? "10", "Page Limit");
    let userId = req.params.id;

    try {
      userId = validateObjectId(userId, "User Id");

    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      const friendsFeedData = await getFriendsReviewsWithInfo(userId, page, limit);
      res.status(200).json(friendsFeedData);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

export default router;