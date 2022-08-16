import { scheduler } from "./cron";
import { app } from "./app";
import mongoose from "mongoose";
import { rootLogger } from "./logger";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        rootLogger.debug({ message: `Started on port ${port}` });
        scheduler();
    });
});
