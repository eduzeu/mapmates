import restaurants from "./restaurants.ts";
import reviews from "./reviews.ts";
import express from "express";

const constructorMethod = (app: express.Express) => {
  console.log("Registering /restaurants route");
  app.use("/restaurants", restaurants);

  console.log("Registering /reviews route");
  app.use("/reviews", reviews);

  console.log("Registering catch-all route");
  app.use((_: express.Request, res: express.Response) => {
    res.status(404).json({ error: "Not found" });
  });

  console.log("Registered all routes")
}

export default constructorMethod;