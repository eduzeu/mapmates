import restaurants from "./restaurants";


const constructorMethod = (app: any) => {
  app.use("/restaurants", restaurants);
  app.use("*", (req: any, res: any) => {
    res.status(404).json({ error: "Not found" });
  });


}

export default constructorMethod;