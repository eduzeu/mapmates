import express, { Router } from "express";
import * as uuid from "uuid";
import xss from "xss";
import * as sessionTokenFunctions from "../data/sessionTokens";
import * as userFunctions from "../data/users";
import { validateEmailAddress, validatePassword, validateString } from "../helpers/validation";
import { users } from '../config/mongoCollections.js';
import { ObjectId } from "mongodb";
const router = Router();

router.route("/")
  // GET /signin route to check session token
  .post(async (req: express.Request, res: express.Response) => {
    if (!req.body) {
      res.status(400).json({ success: false, error: "No request body" });
      return;
    }
    let username = req.body.loginUser as string;
    let password = req.body.loginPassword as string;
    try {
      username = validateString(username, "Username").toLowerCase();
      password = validatePassword(password, "Password");
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return;
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
      return;
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return;
    }
  });

// GET and POST /signup for account creation
router.route("/signup")
  // .get(async (_req: express.Request, res: express.Response) => {
  //   res.render("../views/newAccount", { title: "Welcome to WiFly NYC" });
  // })
  .post(async (req: express.Request, res: express.Response) => {
    const userCollection = await users();
    if (!req.body) {
      res.status(400).json({ success: false, error: "No request body" });
      return;
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
      return;
    }

    username = xss(username);
    email = xss(email);
    password = xss(password);
    confirmPassword = xss(confirmPassword);

    try {
      let usernameCheck = await userCollection.findOne({username: username.toLowerCase()});
      let emailCheck = await userCollection.findOne({email: email.toLowerCase()});
      if(usernameCheck){
        throw("Invalid username");
      }
      if(emailCheck){
        throw("Invalid email");
      }
      await userFunctions.addNewUser(username, email, password);
      res.json({ success: true });
      return;
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.toString() });
      return;
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
      return;
    }
    res.clearCookie("session_token", { httpOnly: true });
    if (isDeleted) {
      res.json({ success: true });
      return;
    } else {
      throw new Error("Failed to delete session");
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.toString() });
    return;
  }
});

router.route("/getUser").get(async (req: express.Request, res: express.Response) => {
  try {
    if(!req.cookies){
      res.status(400).json({error: "Not logged in"});
      return;
    }
    const token = req.cookies["session_token"] as string | undefined;
    let foundUser;
    if (token) {
      foundUser = await sessionTokenFunctions.findUserFromSessionToken(token);
    }
    else {
      res.status(400).json({ error: "Failed to find user" });
      return;
    }
    //res.clearCookie("session_token", { httpOnly: true });
    if (foundUser) {
      res.json({ user: foundUser });
      return;
    } else {
      throw new Error("Failed to find user");
    }
  } catch (error: any) {
    res.status(400).json({ error: error.toString() });
    return;
  }
});

router.route("/loggedIn").get(async (req: express.Request, res: express.Response) => {
  try {
    if(!req.cookies || Object.keys(req.cookies).length == 0){
      res.json({loggedIn: false});
      return;
    }
    const token = req.cookies["session_token"] as string | undefined;
    if(token){
      await sessionTokenFunctions.sessionChecker(token);
    }
    res.json({loggedIn: true});
    return;
  } catch (error: any) {
    res.json({ loggedIn: false });
    return;
  }
});

router.route("/addFriend").post(async (req: express.Request, res: express.Response) => {
  const userCollection = await users();
  try{
    const friendId = req.body.friendId;
    if(!friendId){
      throw("Invalid friend id");
    }
    const token = req.cookies["session_token"] as string | undefined;
    let user;
    if(token){
      await sessionTokenFunctions.sessionChecker(token);
      user = await sessionTokenFunctions.findUserFromSessionToken(token);
    }
    let friendsArray = user.friends.map(id => id.toString());
    let friend = await userCollection.findOne({_id: new ObjectId(friendId)});
    if(!friend){
      throw("Invalid friend id");
    }
    if(friendsArray.includes(friendId)){
      throw("Already friends");
    }
    user.friends.push(new ObjectId(friendId));
    let inserted = await userCollection.findOneAndReplace({_id: user._id}, user);
    if(!inserted){
      throw("Error reinserting user object");
    }
    res.json({success: true});
    return;
  }
  catch (e: any) {
    res.status(400).json({success: false, error: e.toString()});
    return;
  }
});


export default router;