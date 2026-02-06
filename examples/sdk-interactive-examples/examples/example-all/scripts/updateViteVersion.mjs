// (C) 2026 GoodData Corporation

import fs from "fs";
import { createRequire } from "module";

// Avoid JSON import assertions (`assert { type: "json" }`) for compatibility with older Node runtimes.
const require = createRequire(import.meta.url);
const packageData = require("../package.json");

const packageJsonPath = "./package.json";

delete packageData.devDependencies.rolldown;
packageData.devDependencies.vite = "^7.3.1";

await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2));

console.log("Updated package.json with vite ^7.3.1");
