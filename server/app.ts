import express from "express";
import configRoutes from "./routes/index.ts";
import session from "express-session";
import cors from "cors"; 

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
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