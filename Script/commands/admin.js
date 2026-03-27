const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ULLASH", //don't change my credit 
    description: "Show Owner Info",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    var time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    var callback = () => api.sendMessage({
        body: `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃      🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞      : 𝐒𝐢𝐲𝐚𝐦 𝐇𝐚𝐬𝐚𝐧 ッ
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : 𝐌𝐚𝐥𝐞
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : 𝐈𝐧 𝐂𝐨𝐦𝐩𝐥𝐢𝐜𝐚𝐭𝐞𝐝
┃ 🎂 𝐀𝐠𝐞       : 16®
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : 𝐈𝐬𝐥𝐚𝐦
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : 𝐝𝐢𝐩𝐥𝐨𝐦𝐚 𝐢𝐧 𝐀𝐠𝐫𝐢𝐜𝐮𝐥𝐭𝐮𝐫𝐞
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : Burnt Bariya Kishoreganj
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🎭 𝐓𝐢𝐤𝐭𝐨𝐤  : siyam01789
┃ 📢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 : +8801789138157
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/profile.php?id=61568411310748
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
        `,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));
  
    return request(encodeURI(`https://graph.facebook.com/100000478146113/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
        .on('close', () => callback());
};
