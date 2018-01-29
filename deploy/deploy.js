#!/usr/bin/env node
const chalk = require("chalk");
const cp = require("child_process");
const fs = require("fs");

// Captured environment variables
const DEPLOY_USERNAME = process.env.AZURE_DEPLOYMENT_USERNAME;
const DEPLOY_PASSWORD = process.env.AZURE_DEPLOYMENT_PASSWORD;
const BRANCH = process.env.TRAVIS_BRANCH;
const BUILD_DIR = process.env.TRAVIS_BUILD_DIR;
const COMMIT_MESSAGE = process.env.TRAVIS_COMMIT_MESSAGE.split("\n")[0] || "No commit message provided";

const deployFolder = "cl-deploy";
const deployRegex = /\[deploy:\s*(\w+)\]/i;
const masterDeploymentUrl = `https://${DEPLOY_USERNAME}:${DEPLOY_PASSWORD}@catilyfe.scm.azurewebsites.net:443/catilyfe.git`;
const otherDeploymentUrls = {
    justin: `https://${DEPLOY_USERNAME}:${DEPLOY_PASSWORD}@catilyfe-justin.scm.azurewebsites.net:443/catilyfe.git`,
    peter: `https://${DEPLOY_USERNAME}:${DEPLOY_PASSWORD}@catilyfe-peta.scm.azurewebsites.net:443/catilyfe.git`
};

// Ensure we're running in Travis
if (!process.env.TRAVIS) {
    console.log(chalk.red("Deploy script needs to be run by Travis CI. Aborting."));
    process.exit(-1);
}

console.log(`
===TRAVIS DIAGNOSTICS===
  Branch: ${process.env.TRAVIS_BRANCH}
  Commit message: ${process.env.TRAVIS_COMMIT_MESSAGE}
  Event type: ${process.env.TRAVIS_EVENT_TYPE}
`);

let deployParams;
if (process.env.TRAVIS_BRANCH.toLowerCase() === "master") {
    deployToAzure(masterDeploymentUrl);
}
else if (deployParams = COMMIT_MESSAGE.match(deployRegex)) {
    const deployName = deployParams[1];
    const slotUrl = otherDeploymentUrls[deployName];
    if (!slotUrl) {
        console.error(chalk.red(`Invalid deploy name '${deployName}'. Valid names are: ${Object.keys(otherDeploymentUrls).join(",")}`));
    }

    deployToAzure(slotUrl);
}
else {
    console.log("Skipping deployment. Not on master or given deploy command.");
}

function executeCommand(command, throwOnFailure = true) {
    const result = cp.spawnSync(command, {
        stdio: "inherit",
        shell: true
    });
    if (throwOnFailure && (result.status !== 0 || result.error)) {
        throw result.stderr || result.error || result.stdio || result.output;
    }

    return result;
}

function deployToAzure(url) {
    fs.mkdirSync(deployFolder);
    process.chdir(deployFolder);

    // Add azure website
    executeCommand("git init");
    executeCommand(`git remote add azure ${url}`);

    // Build and copy janx
    console.log("\nBuilding project with production flag set...");
    executeCommand(`${BUILD_DIR}/node_modules/@angular/cli/bin/ng build --target production`);
    executeCommand(`cp -r ${BUILD_DIR}/dist/* ./`);

    // Add and commit to deployment repo
    console.log("\nDeploying updated files...");
    executeCommand("git add .");
    const commitResult = executeCommand(`git commit -m "DEPLOY: ${COMMIT_MESSAGE}"`, false);
    if (commitResult.status === 0) {
        // Only execute if commit succeeded (if no files changed, then commit would fail)
        executeCommand("git push -f azure master");
    }
}
