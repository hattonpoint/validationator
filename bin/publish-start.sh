# !/bin/bash
yarn test;
yarn build;
cp src/index.js dist/index.js;
yarn minify;
yarn test:dist;

# move needed files to root
cp -R dist/. ./;

# remove all un-needed files
rm -rf dist src test;
