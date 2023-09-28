#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";
import StringBuilder from "string-builder";
import * as jq from "node-jq";
import { table } from "table";
import { discover } from "./actions/discover";
import pack from "../package.json";

const program = new Command();

program
    .name(pack.name)
    .description(pack.description)
    .version(pack.version, "-v, --version")
    .addHelpText("beforeAll", () => {
        const builder = new StringBuilder();

        builder
            .appendLine("Open source tool to discover AMX devices")
            .appendLine("Copyright (c) 2023, Norgate AV Services Limited")
            .appendLine(pack.repository.url)
            .appendLine()
            .appendLine("===================================================")
            .appendLine();

        return builder.toString();
    })
    .action(async () => {
        const devices = await discover();

        if (devices.length === 0) {
            return;
        }

        console.log(await jq.run(".", devices, { color: true, input: "json" }));
        // console.table(devices, ["ip", "mac", "system", "hostname", "id"]);
        console.log(table(devices.map((device) => Object.values(device))));
    });

program.parse(process.argv);
