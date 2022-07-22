import mongoose from "mongoose";
import { app } from "./app";
import { scheduler } from "./cron";
import { rootLogger } from "./logger";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
  const port = process.env.PORT || 7250;
  app.listen(port, () => {
    rootLogger.debug({message: `Started on port ${port}`});
    scheduler();
  });
});
