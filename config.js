export const reddits = {
    "forhire": {flair: ["Hiring","Hiring - Open"]},
    "hiring": {title: "Hiring"},
    "Jobs4Bitcoins": {title: "Hiring"},
};

export const redisUrls = {
    internal: process.env.REDIS_URL_INTERNAL,
    external: process.env.REDIS_URL_EXTERNAL
};

export const getRedisUrl = () => {
    return (process.env.PLATFORM==="render")?redisUrls.internal:redisUrls.external;
}

export const maxInRedisStore = 100;

export const telegramConfig = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_BOT_CHAT_ID,
};

export const httpGetPath = process.env.HTTP_GET_PATH;

export const useOldReddit = true;