import express from "express";
import { httpGetPath } from "./config.js";
import { execProcess } from "./lib/process.js";
import { libRedis } from "./lib/redis.js";

const port = process.env.PORT || 3000;

const app = express();

app.get(httpGetPath,(req,res) => {
    execProcess();
    res.send("ok");
});

await libRedis.initialize();
app.listen(port,() => console.log(`listening on port ${port}`));