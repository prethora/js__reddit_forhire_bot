import { createClient } from 'redis';
import { reddits, getRedisUrl, maxInRedisStore } from "../config.js";

class RedisLib {
    key = "reddit-post-mem";
    // key = "test-reddit-post-mem";
    store = {};

    async setupClient() {
        const ret = await createClient({
            url: getRedisUrl()
        })
            .on("error", err => console.log('Redis Client Error', err))
            .connect();            
        return ret;
    }

    async readJSON(key,defaultValue = {}) {
        const client = await this.setupClient();
        const value = await client.get(key) || "";
        await client.disconnect();
        try {
            return JSON.parse(value);
        }
        catch(e) {
            return defaultValue;
        }        
    }

    async writeJSON(key,value) {
        const client = await this.setupClient();
        await client.set(key,JSON.stringify(value));
        await client.disconnect();
    }

    async syncWrite() {
        const value = {};
        Object.keys(this.store).forEach((name) => {
            value[name] = this.store[name].list;
        });
        await this.writeJSON(this.key,value);
    }

    async update(codes,dryRun = false) {
        const ret = {};
        const { store } = this;
        let changed = false;
        Object.keys(codes).forEach((name) => {
            ret[name] = [];
            codes[name].forEach((code) => {
                if (!store[name].map[code]) {
                    ret[name].push(code);
                    if (!dryRun) {
                        store[name].list.splice(0,0,code);
                        store[name].map[code] = true;
                        if (store[name].list.length>maxInRedisStore) {
                            for(let i=maxInRedisStore-1;i<store[name].list.length;i++) {
                                const delCode = store[name].list[i];
                                delete store[name].map[delCode];
                            }
                        }
                        changed = true;
                    }    
                }
            });
        }); 
        await this.syncWrite();
        return ret;
    }

    async initialize() {
        const names = Object.keys(reddits);
        const dv = {};
        names.forEach((name) => {
            dv[name] = [];
        });
        const res = await this.readJSON(this.key,dv);
        Object.keys(res).forEach((name) => {
            const { store } = this;
            store[name] = {list: [],map: {}};
            res[name].forEach((code) => {
                store[name].list.push(code);
                store[name].map[code] = true;
            });
        });
    }
}

export const libRedis = new RedisLib();