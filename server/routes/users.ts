import { Router, Request, Response } from "express";
import * as uuid from "uuid";
import xss from "xss";
import * as sessionTokenFunctions from "../data/sessionTokens";
import * as userFunctions from "../data/users.js";
import {
  validateEmailAddress,
  validatePassword,
  validateString,
} from "../helpers.js";

const router = Router();

router.route("/")
  // GET /signin route to check session token
  .get(async (req: Request, res: Response) => {
    try {
      let token = req.cookies["session_token"] as string | undefined;
      await sessionTokenFunctions.sessionChecker(token as string);
      return res.redirect("/home/");
    } catch (e) {
      return res.render("../views/account", {
        title: "Welcome to WiFly NYC",
      });
    }
  })
  .post(async (req: Request, res: Response) => {
    let username = req.body.loginUser as string;
    let password = req.body.loginPassword as string;

    try {
      username = validateString(username, "Username").toLowerCase();
      password = validatePassword(password, "Password");
    } catch (error: any) {
      return res.status(400).json({ error: error.toString() });
    }

    username = xss(username);
    password = xss(password);

    try {
      const user = await userFunctions.checkUser(username, password);
      const sessionId = uuid.v4();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      await sessionTokenFunctions.addSessionToken(sessionId, user.toString(), expiresAt);
      res.cookie("session_token", sessionId, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.redirect("/home");
    } catch (error: any) {
      return res.status(400).render("../views/account", {
        error: error.toString(),
      });
    }
  });

// GET and POST /signup for account creation
router.route("/signup")
  .get(async (_req: Request, res: Response) => {
    res.render("../views/newAccount", { title: "Welcome to WiFly NYC" });
  })
  .post(async (req: Request, res: Response) => {
    let username = req.body.loginUser as string;
    let email = req.body.loginEmail as string;
    let password = req.body.loginPassword as string;
    let confirmPassword = req.body.confirmPassword as string;

    try {
      username = validateString(username, "Username").toLowerCase();
      email = validateEmailAddress(email, "Email");
      password = validatePassword(password, "Password");
      confirmPassword = validatePassword(confirmPassword, "Confirm Password");
      if (confirmPassword !== password) {
        throw new Error("Passwords do not match");
      }
    } catch (error: any) {
      return res
        .status(400)
        .render("../views/newAccount", { error: error.toString() });
    }

    username = xss(username);
    email = xss(email);
    password = xss(password);
    confirmPassword = xss(confirmPassword);

    try {
      const result = await userFunctions.addNewUser(username, email, password);
      res.redirect("/");
    } catch (error: any) {
      return res.status(400).render("newAccount", { error: error.toString() });
    }
  });

router.route("/logout").get(async (req: Request, res: Response) => {
  try {
    const token = req.cookies["session_token"] as string | undefined;
    let isDeleted = false;
    if (token) {
      isDeleted = await sessionTokenFunctions.deleteSessionToken(token);
    }
    res.clearCookie("session_token", { httpOnly: true });
    if (isDeleted) {
      return res.redirect("/");
    } else {
      throw new Error("Failed to delete session");
    }
  } catch (error) {
    return res.status(500).send("An error occurred during logout.");
  }
});

export default router;