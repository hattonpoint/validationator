# !/bin/bash
git add package.json;
git commit -m "update package.json version";
git stash;
rm -rf utilities validate.js validations.js index.js validateFunc.js;
yarn add validationator;
yarn test:prod;