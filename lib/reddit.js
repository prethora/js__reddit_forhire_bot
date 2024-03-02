import fetch from "node-fetch";
import cheerio from "cheerio";
import { write, writeFileSync } from "fs";
import { libTelegram } from "./telegram.js";
import { libRedis } from "./redis.js";
import { useOldReddit } from "../config.js";

class RedditLib {
    async extractFromSubreddits(reddits,pages = 3) {
        const ret = {};
        const names = Object.keys(reddits);
        for(let i=0;i<names.length;i++) {
            const name = names[i];
            ret[name] = await this.extractFromSubreddit(name,reddits[names[i]],pages);            
        }
        return ret;
    }

    async extractFromSubreddit(name,condition,pages = 3) {
        const ret = [];
        const map = {};        
        let url = `https://${useOldReddit?"old":"www"}.reddit.com/r/${name}/new?feedViewType=classicView`;
        while(pages>0) {
            let res = await this.extractFromSubredditPage(url,condition);
            res.posts.forEach((code) => {
                if (!map[code]) {
                    ret.push(code);
                    map[code] = true;
                }
            });
            url = res.moreUrl;
            if (!url) break;
            pages--;                
        }
        return ret;
    }

    async extractFromSubredditPage(url,condition) {
        const ret = {
            posts: [],
            moreUrl: "",
        };
        const response = await fetch(url,{
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
        });
        if (response.ok) {
            const body = await response.text();
            const $ = cheerio.load(body);
            if (useOldReddit) {
                $("div[data-context=listing].link.self").each(function() {
                    const $article = $(this);
                    const code = /comments\/([^\/]+)/.exec($article.find("p.title a").attr("href"))[1];
                    if ((condition?.flair) && ($article.find("p.title span.linkflairlabel").text().trim().toUpperCase()!==condition?.flair.toUpperCase())) {
                        return;
                    }                    
                    if ((condition?.title) && ($($article.find("p.title a")[0]).text().toUpperCase().indexOf(condition?.title.toUpperCase())===-1)) {
                        return;
                    }
                    ret.posts.push(code);
                });
            }
            else {
                $("article").each(function () {
                    const $article = $(this);                
                    const code = /comments\/([^\/]+)/.exec($article.find("a[slot=full-post-link]").attr("href"))[1];
                    if ((condition?.flair) && ($article.find("div.flair-content").text().trim().toUpperCase()!==condition?.flair.toUpperCase())) {
                        return;
                    }
                    if ((condition?.title) && ($article.attr("aria-label").toUpperCase().indexOf(condition?.title.toUpperCase())===-1)) {
                        return;
                    }
                    ret.posts.push(code);
                });
                $("faceplate-partial").each(function(){
                    const src = $(this).attr("src");
                    if (src.startsWith("/svc/shreddit/community-more-posts/")) {
                        ret.moreUrl = `https://${useOldReddit?"old":"www"}.reddit.com${src}`;
                    }
                });    
            }
        }
        else {            
            console.log({status: response.status,statusText: response.statusText});
        }
        return ret;
    }

    async extractPost(name,code) {
        try {
            const url = `https://${useOldReddit?"old":"www"}.reddit.com/r/${name}/comments/${code}`;
            let response = await fetch(url,{
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                },
            });
            if (response.ok) {
                const body = await response.text();
                const $ = cheerio.load(body);
                let postUrl = "";
                if (useOldReddit) {
                    postUrl = $("link[rel=canonical]").attr("href").split("www.reddit.com").join("old.reddit.com");
                }
                else {
                    postUrl = $("shreddit-canonical-url-updater").attr("value");
                }
                response = await fetch(postUrl);
                if (response.ok) {
                    const body = await response.text();
                    const $ = cheerio.load(body);                
                    let user = "";
                    let authorId = "";
                    let postTitle = "";
                    let postBody = "";
                    if (useOldReddit) {
                        user = $("div.link.self a.author").text().trim();
                        authorId = $($("div[data-author-fullname]")[0]).attr("data-author-fullname").trim();
                        postTitle = $("div.link.self a.title").text().trim();
                        postBody = $("div.link.self div.usertext-body").text().trim();
                    }
                    else {
                        user = $("shreddit-post").attr("author");
                        authorId = $("shreddit-post").attr("author-id");                    
                        postTitle = $("shreddit-post").attr("post-title");
                        postBody = $($("div[slot=text-body] p")[0].parentNode).text().trim();
                    }                    
                    const lines = postBody.split("\n").map(x => x.trim());
                    let lastWasEmpty = false;
                    for(let i=lines.length-1;i>=0;i--) {
                        if (lines[i]==="") {
                            if (lastWasEmpty) {
                                lines.splice(i,1);
                            }
                            lastWasEmpty = true;
                        }
                        else {
                            lastWasEmpty = false;
                        }
                    }
                    postBody = lines.join("\n");
                    return {
                        url: postUrl.split("old.reddit.com").join("www.reddit.com"),
                        user,
                        authorId,
                        title: postTitle,
                        body: postBody
                    };
                }            
            }    
        }
        catch(err) {
        }
    }

    async extractPostAndNotify(name,code) {
        const post = await this.extractPost(name,code);        
        if (post) {
            const { url,user,authorId,title,body } = post;
            const message = [
                title,                
                "---------------",
                "\n",
                body,
                "\n",
                "---------------",
                "\n",
                `User: https://www.reddit.com/user/${user}`,
                "\n",
                `Compose: https://www.reddit.com/message/compose/?to=${user}&subject=${encodeURIComponent(`/r/${name} job ad`)}`,
                "\n",
                `Chat: https://chat.reddit.com/user/${authorId}`,
                "\n",
                `Post: ${url}`,
            ].join("\n");
            await libTelegram.send(message);
        }
    }
}

export const libReddit = new RedditLib();