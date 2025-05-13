import express, { Router } from "express";
import xss from "xss";
import {
  addComment,
  addReview,
  deleteComment,
  deleteReview,
  editComment,
  getReviewById,
  ReviewImage,
  reviewsByRestaurant,
  reviewsByUser,
  toggleLike,
  updateReview,
} from "../data/review.ts";
import { handleErrors } from "../helpers/errors.ts";
import { checkForCached, reviewKey } from "../helpers/redis.ts";
import {
  validateDateString,
  validateObjectId,
  validateReviewImage,
  validateString,
} from "../helpers/validation.ts";

const router = Router();

router
  .route("/comment")
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "No request body" });
      return;
    }

    let reviewId: string | undefined = req.body.reviewId;
    let userId: string | undefined = req.body.userId;
    let text: string | undefined = req.body.text;
    let timestamp: string | undefined = req.body.timestamp;

    try {
      reviewId = validateObjectId(reviewId, "Review Id");
      userId = validateObjectId(userId, "User Id");
      text = validateString(text, "Comment Text");
      timestamp = validateDateString(timestamp, "Timestamp");

    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    text = xss(text);

    try {
      const review = await addComment(reviewId, userId, text, timestamp);
      res.status(200).json(review);

    } catch (e) {
      handleErrors(res, e, 500);
    }
  })
  .patch(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "No request body" });
      return;
    }

    let commentId: string | undefined = req.body.commentId;
    let userId: string | undefined = req.body.userId;
    let text: string | undefined = req.body.text;
    let timestamp: string | undefined = req.body.timestamp;

    try {
      commentId = validateObjectId(commentId, "Comment Id");
      userId = validateObjectId(userId, "User Id");
      text = validateString(text, "Comment Text");
      timestamp = validateDateString(timestamp, "Timestamp");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    text = xss(text);

    try {
      const review = await editComment(commentId, userId, text, timestamp);
      res.status(200).json(review);

    } catch (e) {
      handleErrors(res, e, 500);
    }
  })
  .delete(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "No request body" });
      return;
    }

    let commentId: string | undefined = req.body.commentId;
    let userId: string | undefined = req.body.userId;

    try {
      commentId = validateObjectId(commentId, "Comment Id");
      userId = validateObjectId(userId, "User Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      const review = await deleteComment(userId, commentId);
      res.status(200).json(review);

    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

router
  .route("/restaurant/:id")
  .get(async (req: express.Request, res: express.Response) => {
    let id: string | undefined = req.params.id;

    try {
      id = validateString(id, "Restaurant Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      const key = reviewKey(id);
      if (await checkForCached(key, res)) return;

      let reviews = await reviewsByRestaurant(id);
      res.status(200).json(reviews);

    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

router
  .route("/user/:id")
  .get(async (req: express.Request, res: express.Response) => {
    let id: string | undefined = req.params.id;

    try {
      id = validateObjectId(id, "User Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      let reviews = await reviewsByUser(id);
      res.status(200).json(reviews);

    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

router
  .route("/like/")
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "No request body" });
      return;
    }

    let reviewId: string | undefined = req.body.reviewId;
    let userId: string | undefined = req.body.userId;

    console.log("Like request received:", { reviewId, userId });

    try {
      reviewId = validateObjectId(reviewId, "Review Id");
      userId = validateObjectId(userId, "User Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      const review = await toggleLike(reviewId, userId);
      res.status(200).json(review);
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

router
  .route("/:id")
  .get(async (req: express.Request, res: express.Response) => {
    let id: string | undefined = req.params.id;

    try {
      id = validateString(id, "Review Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      if (await checkForCached(id, res)) return;

      let review = await getReviewById(id);
      res.status(200).json(review);
      
    } catch (e) {
      handleErrors(res, e, 500);
    }
  })
  .patch(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ error: "No request body" });
      return;
    }

    let id: string | undefined = req.params.id;
    let text: string | undefined = req.body.text;
    let timestamp: string | undefined = req.body.timestamp;

    try {
      id = validateString(id, "Review Id");
      if (text) text = validateString(text, "Review Text");
      if (timestamp)
        timestamp = validateDateString(req.body.timestamp, "Timestamp");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    let editObj = {};
    if (text) editObj["text"] = xss(text);

    try {
      let updatedReview = await updateReview(id, editObj);
      res.status(200).json(updatedReview);
    } catch (e) {
      handleErrors(res, e, 500);
    }
  })
  .delete(async (req: express.Request, res: express.Response) => {
    let id: string | undefined = req.params.id;

    try {
      id = validateString(id, "Review Id");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    try {
      let deletedReview = await deleteReview(id);
      res.status(200).json(deletedReview);
    } catch (e) {
      handleErrors(res, e, 500);
    }
  });

router.route("/").post(async (req: express.Request, res: express.Response) => {
  console.log(req.body);
  let userId: string | undefined = req.body.userId;
  let restaurantName: string | undefined = req.body.restaurantName;
  let text: string | undefined = req.body.text;
  let timestamp: string | undefined = req.body.timestamp;
  let imageUrl: string | undefined = req.body.imageUrl;
  let altText: string | undefined = req.body.altText;

  let image: ReviewImage | undefined = undefined;

  try {
    userId = validateObjectId(userId, "User Id");
    restaurantName = validateString(restaurantName, "Restaurant Name");
    text = validateString(text, "Review Text");
    timestamp = validateDateString(timestamp, "Timestamp");
    if (imageUrl || altText)
      image = validateReviewImage({ url: imageUrl, altText }, "Review Image");
  } catch (e) {
    handleErrors(res, e, 400);
    return;
  }

  restaurantName = xss(restaurantName);
  text = xss(text);
  if (image?.altText) image.altText = xss(image.altText);

  try {
    let newReview = await addReview(userId, restaurantName, text, timestamp, image);
    res.status(200).json(newReview);
  } catch (e) {
    handleErrors(res, e, 500);
  }
});

export default router;
