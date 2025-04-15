import express from "express";
import configRoutes from "./routes/index.ts";
import session from "express-session";


const app = express();
app.use(express.json);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
