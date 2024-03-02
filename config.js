export const reddits = {
    "forhire": {flair: "Hiring"},
    "hiring": {title: "Hiring"},
    "Jobs4Bitcoins": {title: "Hiring"},
};

export const redisUrls = {
    internal: "redis://red-cngrn1da73kc73c8lcug:6379",
    external: "rediss://red-cngrn1da73kc73c8lcug:Kq46fxGsxPOnVlPFWGKIQPzQOH3JyvUn@oregon-redis.render.com:6379"
};

export const getRedisUrl = () => {
    return (process.env.PLATFORM==="render")?redisUrls.internal:redisUrls.external;
}

export const maxInRedisStore = 100;

export const telegramConfig = {
    token: "7081544825:AAFeeurelIuQyngetPSVfpcm3SghNYFil60",
    chatId: "712317256",
};

export const httpGetPath = "/uydsfusd7ds7fsydd2y828e";

export const useOldReddit = true;