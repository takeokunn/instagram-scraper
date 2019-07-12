require('dotenv').config();

const axios = require('axios');
const puppeteer = require('puppeteer');

const config = {
    cookie: process.env.INSTAGRAM_COOKIE,
    follow_hash: process.env.INSTAGRAM_FOLLOW_QUERY_HASH,
    follower_hash: process.env.INSTAGRAM_FOLLOWER_QUERY_HASH,
};

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

const getBrowserCookie = async () => {
    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;
    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login');
    await page.waitFor("input._2hvTZ");
    await page.type("input[type='text']", username);
    await page.type("input[type='password']", password);
    await page.click("button[type='submit']");
    await page.waitFor('main', { timeout: 12000 });
    await sleep(3000);
    const cookie = await page.evaluate(() => document.cookie, {});
    await browser.close();
    return await cookie;
};

const fetchByUserId = (user_id, query_hash) => {
    const url = "https://www.instagram.com/graphql/query/";
    const payload = {
        headers: {
            "Cookie": config.cookie
        },
        params: {
            query_hash: query_hash,
            variables: `{"id":"${user_id}","include_reel":true,"fetch_mutual":false,"first":50}`
        }
    };
    axios.get(url, payload)
        .then(res => console.log(res.data.data.user))
        .catch(err => console.log(err));
};

const fetchDetailByName = (name, success, failure) => {
    const url = `https://www.instagram.com/${name}`;
    axios.get(url)
        .then(res => success(JSON.parse(res.data.split("window._sharedData = ")[1].split(";</script>")[0])))
        .catch(err => failure(err));
};

const main = async () => {
    const success = detail => {
        const user = detail.entry_data.ProfilePage[0].graphql.user;
        const id = user.id;
        const username = user.username;
        const biography = user.biography;
        const follow = user.edge_follow.count;
        const followed = user.edge_followed.count;
        console.log(followed);
    };
    const failure = err => {
        console.log(err);
    };
    fetchDetailByName("takeokunn", success, failure);
    // await fetchByUserId("3113905237", config.follower_hash);
};

main();
