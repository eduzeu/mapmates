import express, { Router } from "express";
import { handleErrors } from "../helpers/errors.ts";
import { validateDateString, validateString } from "../helpers/validation.ts";
import {
  deleteReview,
  getReviewById,
  reviewsByRestaurant,
  reviewsByUser,
  updateReview,
} from "../data/review.ts";
import xss from "xss";

const router = Router();

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

router.route("/restaurant/:id").get(async (req: express.Request, res: express.Response) => {
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

// router.route("/user/:id").get(async (req: express.Request, res: express.Response) => {
//   let id: string | undefined = req.params.id;

//   try {
//     id = validateString(id, "User Id");

//   } catch (e) {
//     handleErrors(res, e, 400);
//     return;
//   }

//   try {
//     let reviews = await reviewsByUser(id);
//     res.status(200).json(reviews);
    
//   } catch (e) {
//     handleErrors(res, e, 500);
//   }
// });

export default router;
