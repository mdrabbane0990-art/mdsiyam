module.exports.config = {
    name: "cmd",
    version: "1.1.0",
    hasPermssion: 2,
    credits: "MAHBUB SHAON & GEMINI",
    description: "Manage/Control and Install bot modules live",
    commandCategory: "System",
    usages: "[load/unload/loadAll/unloadAll/install/info/count] [name module]",
    cooldowns: 2,
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": "",
        "axios": ""
    }
};

const loadCommand = function ({ moduleList, threadID, messageID, api }) {
    const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
    const { configPath, mainPath } = global.client;
    const logger = require(mainPath + "/utils/log");

    var errorList = [];
    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 2), "utf8");

    for (const nameModule of moduleList) {
        try {
            const dirModule = __dirname + "/" + nameModule + ".js";
            delete require.cache[require.resolve(dirModule)];
            const command = require(dirModule);
            global.client.commands.delete(nameModule);

            if (!command.config || !command.run || !command.config.commandCategory) 
                throw new Error("[CMD] - Module is not properly formatted!");

            global.client.eventRegistered = global.client.eventRegistered.filter(info => info != command.config.name);
            global.client.commands.set(command.config.name, command);
            logger.loader("Loaded command " + command.config.name + "!");

        } catch (error) {
            errorList.push("- " + nameModule + " reason: " + error.message);
        }
    }

    if (errorList.length > 0) {
        api.sendMessage("[CMD] » Some modules failed to load:\n" + errorList.join("\n"), threadID, messageID);
    } else {
        api.sendMessage("[CMD] » Successfully loaded modules: " + moduleList.join(", "), threadID, messageID);
    }

    writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
    unlinkSync(configPath + ".temp");
};

const unloadModule = function ({ moduleList, threadID, messageID, api }) {
    const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
    const { configPath, mainPath } = global.client;
    const logger = require(mainPath + "/utils/log").loader;

    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), "utf8");

    for (const nameModule of moduleList) {
        global.client.commands.delete(nameModule);
        global.client.eventRegistered = global.client.eventRegistered.filter(item => item !== nameModule);
        if (!configValue["commandDisabled"]) configValue["commandDisabled"] = [];
        if (!configValue["commandDisabled"].includes(`${nameModule}.js`)) {
            configValue["commandDisabled"].push(`${nameModule}.js`);
        }
        logger(`Unloaded command ${nameModule}!`);
    }

    writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
    unlinkSync(configPath + ".temp");

    api.sendMessage(`[CMD] » Successfully unloaded ${moduleList.length} command(s)`, threadID, messageID);
};

module.exports.run = async function ({ event, args, api }) {
    if (!api || !api.sendMessage) return;

    // মিরাই বটের অফিশিয়াল অ্যাডমিন লিস্ট চেক (আইডি লক রিমুভ করা হয়েছে)
    const { ADMINBOT } = global.config;
    if (!ADMINBOT.includes(event.senderID)) {
        return api.sendMessage("[CMD] » You are not authorized to use this admin command!", event.threadID, event.messageID);
    }

    const { readdirSync, writeFileSync } = global.nodemodule["fs-extra"];
    const axios = require("axios");
    const { join } = require("path");
    const { threadID, messageID } = event;

    var moduleList = args.slice(1);

    switch (args[0]) {
        case "count": {
            api.sendMessage(`[CMD] - Currently loaded commands: ${global.client.commands.size}`, threadID, messageID);
            break;
        }
        case "load": {
            if (moduleList.length == 0) return api.sendMessage("[CMD] » Module name cannot be blank!", threadID, messageID);
            return loadCommand({ moduleList, threadID, messageID, api });
        }
        case "unload": {
            if (moduleList.length == 0) return api.sendMessage("[CMD] » Module name cannot be blank!", threadID, messageID);
            return unloadModule({ moduleList, threadID, messageID, api });
        }
        case "loadAll": {
            moduleList = readdirSync(__dirname).filter(file => file.endsWith(".js") && !file.includes("example"));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
            return loadCommand({ moduleList, threadID, messageID, api });
        }
        case "unloadAll": {
            moduleList = readdirSync(__dirname).filter(file => file.endsWith(".js") && !file.includes("example") && !file.includes("cmd"));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
            return unloadModule({ moduleList, threadID, messageID, api });
        }
        case "install": {
            if (moduleList.length < 2) return api.sendMessage("[CMD] » Usage: install [Filename.js] https://www.qr-code-generator.com/", threadID, messageID);
            
            let fileName = moduleList[0];
            if (!fileName.endsWith(".js")) fileName += ".js";
            
            let rawCode = "";
            let source = moduleList[1];

            if (source.startsWith("http://") || source.startsWith("https://")) {
                // লিঙ্ক প্রসেসিং (GitHub/Pastebin raw কনভার্ট)
                if (source.includes("pastebin.com") && !source.includes("/raw/")) {
                    source = source.replace("pastebin.com/", "pastebin.com/raw/");
                }
                if (source.includes("github.com") && source.includes("/blob/")) {
                    source = source.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
                }
                try {
                    const res = await axios.get(source);
                    rawCode = res.data;
                } catch (err) {
                    return api.sendMessage("❌ | Failed to fetch code from the URL!", threadID, messageID);
                }
            } else {
                // সরাসরি টেক্সট কোড প্রসেস
                rawCode = event.body.slice(event.body.indexOf(moduleList[0]) + moduleList[0].length).trim();
            }

            if (!rawCode) return api.sendMessage("❌ | No code found to install!", threadID, messageID);

            try {
                const pathFile = join(__dirname, fileName);
                writeFileSync(pathFile, rawCode, "utf8");
                
                // ইনস্টল করার পর অটোমেটিক লোড করা
                return loadCommand({ moduleList: [fileName.replace(".js", "")], threadID, messageID, api });
            } catch (err) {
                return api.sendMessage(`❌ | Installation failed: ${err.message}`, threadID, messageID);
            }
        }
        case "info": {
            const command = global.client.commands.get(moduleList.join("") || "");
            if (!command) return api.sendMessage("[CMD] » The specified module does not exist!", threadID, messageID);

            const { name, version, hasPermssion, credits, cooldowns, dependencies } = command.config;
            return api.sendMessage(
                `====== ${name.toUpperCase()} ======\n` +
                `- Created by: ${credits}\n` +
                `- Version: ${version}\n` +
                `- Required Permission: ${hasPermssion == 0 ? "User" : hasPermssion == 1 ? "Admin" : "Support"}\n` +
                `- Cooldown: ${cooldowns} second(s)\n` +
                `- Dependencies: ${(Object.keys(dependencies || {})).join(", ") || "None"}`,
                threadID, messageID
            );
        }
        default: {
            return api.sendMessage("[CMD] » Invalid syntax! Use load/unload/install/loadAll/info", threadID, messageID);
        }
    }
};
