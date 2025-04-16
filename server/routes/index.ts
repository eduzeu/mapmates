import restaurants from "./restaurants";
import users from "./users";

const constructorMethod = (app: any) => {
  app.use("/restaurants", restaurants);
  app.use("/users", users)
  app.use("*", (req: any, res: any) => {
    res.status(404).json({ error: "Not found" });
  });


}

export default constructorMethod;