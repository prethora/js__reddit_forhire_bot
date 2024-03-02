import { reddits } from "./config.js";
import { libReddit } from "./lib/reddit.js";

console.log(await libReddit.extractFromSubreddit("hiring",reddits.hiring));
// console.log(await libReddit.extractPost("forhire","1b4f6jd"));
