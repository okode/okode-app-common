#!/bin/bash
set -eo pipefail

if [[ $# -ne 2 ]]; then
    echo "Syntax: release [CURRENT_VERSION] [NEXT_VERSION]"
    exit 1
fi

if [[ -n $(git status -z) ]]; then
    echo "Repository not clean, ensure you have committed all your changes"
    exit 1
fi

CURRENT=$1
NEXT=$2
BRANCH=$(git branch | grep \* | cut -d ' ' -f2-)

if [[ $BRANCH == "develop" ]]
then

    # Ensuring master is updated
    echo "Ensuring master is updated"
    git checkout master
    git pull
    git checkout develop

    # Create release
    git flow release start $CURRENT || exit 1
    GIT_MERGE_AUTOEDIT=no git flow release finish -m $CURRENT $CURRENT
    git checkout master

    # Publish release
    git push origin HEAD --tags

    # Merge release into develop
    git checkout develop
    git merge master
else
    # Create new tag
    git tag -a $CURRENT -m"$CURRENT"

    # Publish tag
    git push --tags
fi

# Bump version: package.json
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEXT\"/" package.json

# Ensure package-lock.json is updated
npm install

# Update develop with new bumped version
git commit -a -m"Bumped version ($NEXT) [ci skip]"
git push
