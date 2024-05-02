pipeline {
    agent { label "gcp-hodor-slave-generic"}
    options {
       // Add timestamps to output.
       timestamps()
       timeout(time: 10, unit: 'MINUTES')
    }
    environment {
        repoOwner = "starknet-io"
        repoName = "starknet-docs"
        prId = "${env.CHANGE_ID}"
        prPrefix = "pr"
        comment = "Your preview build is ready! ✨ Check the following link in 1-2 minutes: https://${repoOwner}.github.io/${repoName}/${prPrefix}-${prId}/documentation/ ."
        GITHUB_CREDENTIALS = credentials('gh-starknet-docs-pat')
    }
    stages {
        stage('Build') {
            steps {
                script {
                    sh label:"Install node modules", script:
                    """
                        git fetch
                        git checkout gh-pages
                        ls -la
                    """
                }
            }
        }
    }
    post {
        cleanup {
            deleteDir()
        }
    }
}
