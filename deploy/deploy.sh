#!/bin/bash
set -e # stop on errors

deployFolder="./catilyfe-frontend-deployment"
deployRepo="git@github.com:deuxmoto/catilyfe-frontend-deployment.git"

if [ ! $TRAVIS ]; then
    echo "Deploy script needs to be run by Travis CI. Aborting."
    exit
fi

if [ ! -d "$deployFolder" ]; then
    printf "The dist repo '$deployFolder' doesn't exist! Attempting to clone into it...\n"
    git clone "$deployRepo"
fi

# Remove all existing deployment files
cd "$deployFolder"
git rm -r ./* --ignore-unmatch
cd ..
printf "Finished removing existing deployment files.\n\n"

# Build n copy janx
ng build --target production
cp -r ../dist/* "$deployFolder"
printf "Build finished and out files copied to deployment folder.\n"

# Add and commit to deployment repo
cd "$deployFolder"
git add .
git commit -m "Deploy janx"
git push
cd ..

printf "Deployment finished!"
