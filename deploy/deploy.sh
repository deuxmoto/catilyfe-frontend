deployFolder="./catilyfe-frontend-deployment"
deployRepo="git@github.com:deuxmoto/catilyfe-frontend-deployment.git"

if [ ! -d "$deployFolder" ]; then
    (>&2 echo "The dist repo '$deployFolder' doesn't exist! Attempting to clone into it...")
    git clone "$deployRepo"
fi

# Remove all existing dist files
cd "$deployFolder"
git rm -r ./*
cd ..
echo "Done removing dist"

# Build n copy janx
if ! ng build --target production; then
    exit
fi
cp -r ../dist/* "$deployFolder"
echo "Done building n copying janx"

# Add and commit to deployment repo
cd "$deployFolder"
git add .
git commit -m "Deploy janx"
git push
cd ..
