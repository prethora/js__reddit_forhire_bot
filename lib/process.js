import { reddits } from "../config.js";
import { libReddit } from "./reddit.js";
import { libRedis } from "./redis.js";

let isRunning = false;

export const execProcess = async () => {
    if (isRunning) return;
    const timestamp = new Date().getTime();
    isRunning = true;    
    const codes = await libReddit.extractFromSubreddits(reddits);
    const toNotify = await libRedis.update(codes,true);
    const names = Object.keys(toNotify);
    let notifications = 0;
    for(let i=0;i<names.length;i++) {
        const name = names[i];
        const codesToNotify = toNotify[name];
        for(let j=0;j<codesToNotify.length;j++) {
            const code = codesToNotify[j];
            await libReddit.extractPostAndNotify(name,code);
            notifications++;
        }
    }
    await libRedis.update(codes);
    isRunning = false;
    const timespan = (new Date().getTime()-timestamp);
    console.log(`Process completed in ${timespan} ms. Notifications sent: ${notifications}`);
};