import fetch from "node-fetch";
import { telegramConfig } from "../config.js";
import { libMisc } from "./misc.js";

class TelegramLib {
    async send(message) {        
        for(let i=0;i<5;i++) {
            try {
                const rawResponse = await fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`,{
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chat_id: telegramConfig.chatId,
                        text: message,
                        link_preview_options: {
                            is_disabled: true,
                        }
                    }),
                });
                const res = await rawResponse.json();
                if (res?.ok===true) {
                    return true;
                }        
            }
            catch(err) {
            }
            await libMisc.wait(500);
        }
        return false;
    }
}

export const libTelegram = new TelegramLib();