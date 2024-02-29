import fetch from "node-fetch";
(async () => {
    const response = await fetch("https://www.google.com");
    const body = await response.text();
    console.log(body.length);
})();