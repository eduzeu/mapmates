import express, { Router } from "express";
import xss from "xss";
import {
  addComment,
  addReview,
  deleteComment,
  deleteReview,
  editComment,
  getReviewById,
  reviewsByRestaurant,
  reviewsByUser,
  updateReview,
} from "../data/review.ts";
import { handleErrors } from "../helpers/errors.ts";
import { validateCloudinaryUrl, validateDateString, validateString } from "../helpers/validation.ts";

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
      reviewId = validateString(reviewId, "Review Id");
      userId = validateString(userId, "User Id");
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
      commentId = validateString(commentId, "Comment Id");
      userId = validateString(userId, "User Id");
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
      commentId = validateString(commentId, "Comment Id");
      userId = validateString(userId, "User Id");
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
      id = validateString(id, "User Id");
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
      let review = await getReviewById(id);
      res.status(200).json(review);
    } catch (e) {
      handleErrors(res, e, 500);
    }
  })
  .patch(async (req: express.Request, res: express.Response) => {
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
    if (timestamp) editObj["timestamp"] = xss(timestamp);

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

router
  .route("/")
  .post(async (req: express.Request, res: express.Response) => {
    let userId: string | undefined = req.body.userId;
    let placeId: string | undefined = req.body.placeId;
    let text: string | undefined = req.body.text;
    let timestamp: string | undefined = req.body.timestamp;
    let image: string | undefined = req.body.image;

    try {
      userId = validateString(userId, "User Id");
      placeId = validateString(placeId, "Place Id");
      text = validateString(text, "Review Text");
      timestamp = validateDateString(timestamp, "Timestamp");
      if (image) image = validateCloudinaryUrl(image, "Image URL");
    } catch (e) {
      handleErrors(res, e, 400);
      return;
    }

    text = xss(text);

    try {
      let newReview = await addReview(userId, placeId, text, timestamp, image);
      res.status(200).json(newReview);
    } catch (e) {
      handleErrors(res, e, 500);
    }
  })

export default router;
