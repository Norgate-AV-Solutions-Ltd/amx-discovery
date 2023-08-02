import { Command } from "@commander-js/extra-typings";
import * as jq from "node-jq";
import { name, description, version } from "../package.json";
import { discover } from "./actions/discover";

const program = new Command();

program
    .name(name)
    .description(description)
    .version(version, "-v, --version")
    .action(async () => {
        const devices = await discover();

        if (devices.length === 0) {
            return;
        }

        console.log(await jq.run(".", devices, { input: "json" }));
    });

program.parse(process.argv);
