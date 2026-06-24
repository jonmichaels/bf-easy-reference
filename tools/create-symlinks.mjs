// adapted from https://foundryvtt.wiki/en/development/guides/improving-intellisense

import * as fs from "fs";
import yaml from "js-yaml";
import path from "path";

console.log("Black Flag Easy Reference | Reforging Symlinks");

const symlinkConfigPath = "symlink-config.yaml";

if (fs.existsSync(symlinkConfigPath)) {
  try {
    await fs.promises.mkdir("foundry");
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  const sc = await fs.promises.readFile(symlinkConfigPath, "utf-8");
  const symlinkConfig = yaml.load(sc);

  const foundryFileRoot = await getFoundryFileRoot(
    symlinkConfig.foundryInstallPath,
  );
  if (foundryFileRoot !== "") {
    await linkFoundryJavaScriptFiles(foundryFileRoot);
    await linkFoundryLanguageFiles(foundryFileRoot);
  }

  if (!!symlinkConfig.blackFlagInstallPath) {
    await linkBlackFlagFiles(symlinkConfig.blackFlagInstallPath);
  }
} else {
  console.log(
    `Black Flag Easy Reference | ${symlinkConfigPath} not found. Create this file in the project root using the example file for guidance.`,
  );
}

async function getFoundryFileRoot(foundryInstallPath) {
  try {
    // As of 13.338, the Node install is *not* nested but electron installs *are*
    const nested = fs.existsSync(
      path.join(foundryInstallPath, "resources", "app"),
    );

    if (nested) {
      return path.join(foundryInstallPath, "resources", "app");
    } else {
      return foundryInstallPath;
    }
  } catch (err) {
    console.error(`Black Flag Easy Reference | Error reading ${symlinkConfigPath}: ${err}`);
  }

  return "";
}

async function linkFoundryLanguageFiles(foundryFileRoot) {
  try {
    await fs.promises.symlink(
      path.join(foundryFileRoot, "public", "lang"),
      path.join("foundry", "lang"),
    );
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
}

async function linkFoundryJavaScriptFiles(foundryFileRoot) {
  for (const p of ["client", "common", "tsconfig.json"]) {
    try {
      await fs.promises.symlink(
        path.join(foundryFileRoot, p),
        path.join("foundry", p),
      );
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
  }
}

async function linkBlackFlagFiles(blackFlagFileRoot) {
  await fs.promises.symlink(
    path.join(blackFlagFileRoot, "."),
    path.join("foundry", "black-flag"),
  );
}
