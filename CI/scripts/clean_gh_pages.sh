#!/bin/bash

AUTH_TOKEN=$1
OWNER=$2
REPO=$3


function list_closed_prs() {
    curl -sL \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=closed&per_page=100" | jq -r '.[].number'
}


function delete_matching_dirs() {
    local closed_prs=($(list_closed_prs))
    for pr_number in "${closed_prs[@]}"
    do
        if [ -d "pr-${pr_number}" ]
        then
            echo "Deleting directory pr-${pr_number}"
        fi
    done
}

delete_matching_dirs

exit 0