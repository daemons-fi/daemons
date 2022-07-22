import mongoose from "mongoose";
import { app } from "./app";
import { rootLogger } from "./logger";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    rootLogger.debug({message: `Started on port ${port}`});
  });
});
