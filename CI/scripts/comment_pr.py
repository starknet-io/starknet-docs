import requests
import argparse


def comment_pr(api_url, auth_token, owner, repo, pr_id, comment):
    url = f"{api_url}/repos/{owner}/{repo}/issues/{pr_id}/comments"

    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }

    payload = {
        "body": comment
    }

    try:
        response = requests.post(url=url, headers=headers, json=payload)
        if response.status_code in (200, 201):
            print('Comment posted successfully!')
            print('Response:', response.json())
        else:
            print('Request failed with status code:', response.status_code)
    except Exception as e:
        print(e)


def main():
    parser = argparse.ArgumentParser(description="Create a comment on Github pull request.")
    parser.add_argument("-u", "--api_url", required=False, default="https://api.github.com", help="Github api url.")
    parser.add_argument("-a", "--auth_token", required=True, help="The Github auth token. Used to authenticate with Github.")
    parser.add_argument("-o", "--owner", required=True, help="The repo owner")
    parser.add_argument("-r", "--repo", required=True, help="The name of the repo")
    parser.add_argument("-p", "--pr", required=True, help="The pull request id/number")
    parser.add_argument("-c", "--comment", required=True, help="The message to comment")
    args = parser.parse_args()

    comment_pr(args.api_url, args.auth_token, args.owner, args.repo, args.pr, args.comment)

    exit(0)


if __name__ == "__main__":
    main()
