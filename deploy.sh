#!/bin/bash
set -e # stop on errors

deployFolder="./catilyfe-frontend-deployment"
deployRepo="git@github.com:deuxmoto/catilyfe-frontend-deployment.git"

# Ensure we're running in Travis
if [ ! $TRAVIS ]; then
    echo "Deploy script needs to be run by Travis CI. Aborting."
    exit
fi

printf "===DIAGNOSTICS===\n  Branch: $TRAVIS_BRANCH\n  Commit message: $TRAVIS_COMMIT_MESSAGE\n  Event type: $TRAVIS_EVENT_TYPE\n\n"
exit

# Clone the frontend deployment folder
if [ ! -d "$deployFolder" ]; then
    printf "The dist repo '$deployFolder' doesn't exist! Attempting to clone into it...\n"
    git clone "$deployRepo"
fi

# Remove all existing deployment files
cd "$deployFolder"
git rm -r ./* --ignore-unmatch
cd ..
printf "Finished removing existing deployment files.\n\n"

# Build and copy janx
./node_modules/@angular/cli/bin/ng build --target production
cp -r ./dist/* "$deployFolder"
printf "Build finished and out files copied to deployment folder.\n"

# Add and commit to deployment repo
cd "$deployFolder"
git add .
if git commit -m "DEPLOY: $TRAVIS_COMMIT_MESSAGE"; then
    git push
fi
cd ..

printf "Deployment finished!"
