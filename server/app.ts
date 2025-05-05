import cookieParser from 'cookie-parser';
import cors from "cors";
import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.ts";

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

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});