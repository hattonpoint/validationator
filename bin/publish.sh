#!/bin/bash
git add .;
git commit -m 'Publish new version to NPM';
yarn build;
yarn minify;
cp src/index.js dist/index.js;
yarn test;

# move needed files to root
cp -R dist/. ./;

# remove all un-needed files
rm -rf bin dist node_modules src test .eslintrc.json .gitignore;

# # publish
# npm publish;

# # revert changes
# git stash;
# yarn;