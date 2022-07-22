import mongoose from "mongoose";
import { app } from "./app";
import { scheduler } from "./cron";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
  const port = process.env.PORT || 7250;
  app.listen(port, () => {
    console.log(`Daemonic Bots Container has started! Listening on port ${port}`);
    scheduler();
  });
});
