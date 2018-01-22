#!/usr/bin/env node
const chalk = require("chalk");
const cp = require("child_process");
const fs = require("fs");

const deployFolder = "cl-deploy";
const deployRepo = "git@github.com:deuxmoto/catilyfe-frontend-deployment.git";

function executeCommand(command, throwOnFailure=true) {
    const result = cp.spawnSync(command, {
        stdio: "inherit",
        shell: true
    });
    if (throwOnFailure && (result.status !== 0 || result.error)) {
        console.error(`STATUS: ${result.status}`);
        console.error(`STDERR: ${result.stderr}`);
        console.error(`ERROR: ${result.error}`);
        console.error(`STDIO: ${result.stdio}`);
        console.error(`OUTPUT: ${result.output}`);
        throw result.stderr || result.error || result.stdio || result.output;
    }

    return result;
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
executeCommand(`${process.env.TRAVIS_BUILD_DIR}/node_modules/@angular/cli/bin/ng build --target production`);
executeCommand(`cp -r ${process.env.TRAVIS_BUILD_DIR}/dist/* ./`);

// Add and commit to deployment repo
console.log("\nDeploying updated files...");
executeCommand("git add .");
const commitResult = executeCommand(`git commit -m "DEPLOY: ${process.env.TRAVIS_COMMIT_MESSAGE}"`, false);
if (commitResult.status === 0) {
    // Only execute if commit succeeded (if no files changed, then commit would fail)
    executeCommand("git push");
}
