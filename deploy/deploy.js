#!/usr/bin/env node
const chalk = require("chalk");
const cp = require("child_process");
const fs = require("fs");

const deployFolder = "cl-deploy";
const deployRepo = "git@github.com:deuxmoto/catilyfe-frontend-deployment.git";
const BRANCH = process.env.TRAVIS_BRANCH;
const BUILD_DIR = process.env.TRAVIS_BUILD_DIR;
const COMMIT_MESSAGE = process.env.TRAVIS_COMMIT_MESSAGE;

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

function deployMaster() {
    // Clone the frontend deploy repo and navigate to it
    if (!fs.existsSync(`${deployFolder}`)) {
        console.log(chalk.blue(`The deploy folder '${deployFolder}' doesn't exist! Attempting to clone into the repo...`));
        executeCommand(`git clone ${deployRepo} ${deployFolder}`);
    }
    process.chdir(deployFolder);

    // Remove all existing deployed files
    console.log("\nRemoving existing deployment files...");
    executeCommand("git rm -r ./* --ignore-unmatch");

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
        executeCommand("git push");
    }
}

function deployOther() {
    fs.mkdirSync(deployFolder);
    process.chdir(deployFolder);

    // Add azure website
    executeCommand("git init");
    executeCommand(`git remote add azure https://deuxmoto:${AZURE_DEPLOYMENT_PASSWORD}@catilyfe-staging.scm.azurewebsites.net:443/catilyfe.git`);

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
        executeCommand("git push azure master");
    }
}


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

if (process.env.TRAVIS_BRANCH.toLowerCase() === "master") {
    deployMaster();
}
else {
    deployOther();
}
