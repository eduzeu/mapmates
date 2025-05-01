import express, { Router } from "express";
import * as uuid from "uuid";
import xss from "xss";
import * as sessionTokenFunctions from "../data/sessionTokens";
import * as userFunctions from "../data/users";
import { validateEmailAddress, validatePassword, validateString } from "../helpers/validation";
const router = Router();

router.route("/")
  // GET /signin route to check session token
  // .get(async (req: express.Request, res: express.Response) => {
  //   try {
  //     let token = req.cookies["session_token"] as string | undefined;
  //     await sessionTokenFunctions.sessionChecker(token as string);
  //     return res.redirect("/home/");
  //   } catch (e) {
  //     return res.render("../views/account", {
  //       title: "Welcome to MapMates",
  //     });
  //   }
  // })
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ success: false, error: "No request body" });
      return res;
    }
    let username = req.body.loginUser as string;
    let password = req.body.loginPassword as string;
    try {
      username = validateString(username, "Username").toLowerCase();
      // password = validatePassword(password, "Password");
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return res;
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
        maxAge: 60 * 30 * 1000,
        httpOnly: true,
      });
      res.json({ success: true });
      return res;
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return res;
    }
  });

// GET and POST /signup for account creation
router.route("/signup")
  // .get(async (_req: express.Request, res: express.Response) => {
  //   res.render("../views/newAccount", { title: "Welcome to WiFly NYC" });
  // })
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ success: false, error: "No request body" });
      return res;
    }
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
      res.status(400).json({ success: false, error: error.toString() });
      return res;
    }

    username = xss(username);
    email = xss(email);
    password = xss(password);
    confirmPassword = xss(confirmPassword);

    try {
      const result = await userFunctions.addNewUser(username, email, password);
      res.json({ success: true });
      return res;
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return res;
    }
  });

router.route("/logout").get(async (req: express.Request, res: express.Response) => {
  try {
    const token = req.cookies["session_token"] as string | undefined;
    let isDeleted = false;
    if (token) {
      isDeleted = await sessionTokenFunctions.deleteSessionToken(token);
    }
    else {
      res.status(400).json({ success: false, error: "No cookie to delete" });
      return res;
    }
    res.clearCookie("session_token", { httpOnly: true });
    if (isDeleted) {
      res.json({ success: true });
      return res;
    } else {
      throw new Error("Failed to delete session");
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.toString() });
    return res;
  }
});

router.route("/getuser").get(async (req: express.Request, res: express.Response) => {
  try {
    if(!req.cookies){
      res.status(400).json({error: "Not logged in"});
    }
    const token = req.cookies["session_token"] as string | undefined;
    let foundUser;
    if (token) {
      foundUser = await sessionTokenFunctions.findUserFromSessionToken(token);
    }
    else {
      res.status(400).json({ error: "Failed to find user" });
      return res;
    }
    res.clearCookie("session_token", { httpOnly: true });
    if (foundUser) {
      res.json({ user: foundUser });
      return res;
    } else {
      throw new Error("Failed to find user");
    }
  } catch (error: any) {
    res.status(400).json({ error: error.toString() });
    return res;
  }
});


export default router;