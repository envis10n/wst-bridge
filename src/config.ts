import fs from "fs";
import path from "path";

const configPath = path.resolve(process.cwd(), "config.json");

interface IConfig {
    local: {
        host: string;
        port: number;
    };
    remote: string;
}

if (!fs.existsSync(configPath)) {
    console.log("Unable to locate config.json\nWriting new configuration file...");
    fs.writeFileSync(
        configPath,
        JSON.stringify(
            {
                local: {
                    host: "localhost",
                    port: 13337,
                },
                remote: "wss://mudjs.net:13337",
            },
            null,
            4,
        ),
    );
}

const configData = fs.readFileSync(configPath, { encoding: "utf-8" });

const configObj = JSON.parse(configData);

let localHost: string = "localhost";
let localPort: number = 13337;
let remoteURI: string = "wss://mudjs.net:13337";

if (configObj.local !== undefined) {
    if (configObj.local.host !== undefined && typeof configObj.local.host === "string")
        localHost = configObj.local.host;
    if (
        configObj.local.port !== undefined &&
        typeof configObj.local.port === "number" &&
        !isNaN(configObj.local.port) &&
        configObj.local.port > 0 &&
        configObj.local.port <= 65535
    )
        localPort = configObj.local.port;
}
if (configObj.remote !== undefined && typeof configObj.remote === "string") {
    remoteURI = configObj.remote;
}

const config: IConfig = {
    local: {
        host: localHost,
        port: localPort,
    },
    remote: remoteURI,
};

export = config;

console.log("Configuration loaded.");
