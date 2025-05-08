import cookieParser from 'cookie-parser';
import cors from "cors";
import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.ts";
import * as sessionTokenFunctions from "./data/sessionTokens";


const app = express();

app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  credentials: true
}));

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}))

app.use(express.json());

app.use('/', async (req: express.Request, res: express.Response, next) => {
  const timestamp = new Date().toUTCString();
  const method = req.method;
  const route = req.originalUrl;
  let authorizedUser = false;
  let sessionId;
  try {
    sessionId = req.cookies["session_token"];
    let checked = await sessionTokenFunctions.sessionChecker(sessionId);
    if (checked == null) {
      throw 'Failed check';
    }
    authorizedUser = true;
  } catch (e) {
    authorizedUser = false;
  }
  if(authorizedUser){
    let didWork = await sessionTokenFunctions.updateExpiration(sessionId);
    res.cookie("session_token", sessionId, { maxAge: 60 * 60 * 1000, httpOnly: true });
  }
  console.log(route, authorizedUser);
  if(route == '/users/' || route == '/users/signup'){
    if(authorizedUser){
      res.json({error: "Already logged in"});
      return;
    }
  }
  // else if(route.startsWith('/location')){
  //   return res.redirect('/home/');//if a user tries to get to the /location routes send them to error page. MAKE ROUTE FOR /ERROR that links back to home if authorized
  //   //and '/' if unauthorized
  // }
  // else if(route.startsWith('/review')){
  //   return res.redirect('/home');//same as above
  // }
  else {
    if (!authorizedUser) {
      res.json({error: "Not logged in"});
      return;
    }
  }
  next();
});
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});