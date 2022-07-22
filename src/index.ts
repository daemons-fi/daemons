import mongoose from "mongoose";
import { app } from "./app";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Storage has started! Listening on port ${port}`);
  });
});
