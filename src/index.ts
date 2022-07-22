import { scheduler } from "./cron";
import { app } from "./app";
import { rootLogger } from "./logger";

const port = process.env.PORT || 4000;
app.listen(port, () => {
    rootLogger.debug({message: `Started on port ${port}`});
    scheduler();
});
