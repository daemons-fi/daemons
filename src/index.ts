import { scheduler } from "./cron";
import { app } from "./app";

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Admin has started! Listening on port ${port}`);
    scheduler();
});
