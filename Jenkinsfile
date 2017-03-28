// Global variables
NEXUS_PROXY = "https://nexus.ci.data.com/nexus/content/groups/npm-all/"
GIT_SOMA_SSH_CREDENTIAL = "8ee1b190-5d0e-463b-a516-45c7261723ce"

BENCHMARKING_JENKINS_JOB = "raptor-performance-benchmark"
BENCHMARKING_ARTEFACT_REPO = "git@git.soma.salesforce.com:raptor/benchmark-artefacts.git"

// FIXME: Waiting for git service user
GIT_USER_EMAIL = "p.dartus@salesforce.com"
GIT_USER_NAME = "p-dartus"

def helpers

// must specify the CloudBees docker label which maps to the appropriate docker image
// aka do not change this.
node("raptor_node") {
    try {
        // CloudBees reports each stage separately providing us with visibility into
        // run time and failure at a glance

        stage("Git Clone") {
            // checkout according to jenkins project config (eg git clone + git checkout)
            checkout scm

            // Inject helpers
            helpers = load("scripts/pipeline-helpers.groovy")
        }

        stage("Environment Setup") {
            // Add credentials to exising npmrc file
            withCredentials([file(credentialsId: 'team-auraframework_nexus-token', variable: 'NPMRC')]) {
                sh "cat $NPMRC >> .npmrc"
            }

            // yarn doesn't support command line override so set some globals
            sh "yarn config set registry $NEXUS_PROXY"

            // FIXME: Need to add git.soma.salesforce.com as trusted server
            sh "mkdir ~/.ssh && ssh-keyscan -H git.soma.salesforce.com >> ~/.ssh/known_hosts"

            // Setup git config
            sh "git config --global user.email $GIT_USER_EMAIL"
            sh "git config --global user.name $GIT_USER_NAME"
        }

        stage("Build") {
            helpers.yarnInstall()
        }

        stage("Static Analysis") {
            sh "yarn run lint"
        }

        stage("Test") {
            sh "yarn test"
        }

        stage("Publish benchmark") {
            dir("benchmarking") {
                helpers.yarnInstall()

                // Inject git credentials
                sshagent([GIT_SOMA_SSH_CREDENTIAL]) {
                    // Clone the artefact repo as the dist folder
                    sh "git clone $BENCHMARKING_ARTEFACT_REPO dist"

                    // Build the benchmark artefact for the current commit
                    sh "NO_ALIAS=true yarn run build"

                    // Commit and push the artefact folder
                    // Requires a mutex to avoid multiple multiple commit and push occuring a the same time and resulting to merge conflict
                    lock('build-benchmark-bundle') {
                        dir ("dist") {
                            sh "git pull origin master "
                            sh "git add . && git commit -a -m 'Add bundle for commit'"
                            sh "git push origin master"
                        }
                    }
                }

                def currentCommit = helpers.getCommitHash("HEAD")

                // CHANGE_URL is set only when the job is triggered by opening a PR
                // or by pushing on an existing PR
                // if (env.CHANGE_URL) {
                //     triggerBenchmark("origin/$env.CHANGE_TARGET", currentCommit, CHANGE_URL)
                // }
            }
        }
    } catch (e) {
        // retrieve last committer email
        env.GIT_COMMIT_EMAIL = sh (
            script: 'git --no-pager show -s --format=\'%ae\'',
            returnStdout: true
        ).trim()

        mail (
            to: env.GIT_COMMIT_EMAIL,
            subject: "Failed ${env.JOB_NAME} on ${env.BRANCH_NAME} / ${env.BUILD_DISPLAY_NAME}",
            body: "Please go to ${env.BUILD_URL}."
        );

        throw e
    }
}

// Start async the performance benchmark of 2 commits.
def triggerBenchmark(String baseBranch, String compareCommit, String changeURL) {
    build (
        job: BENCHMARKING_JENKINS_JOB,
        parameters: [
            [$class: 'StringParameterValue', name: 'baseBranch', value: baseBranch],
            [$class: 'StringParameterValue', name: 'compareCommit', value: compareCommit],
            [$class: 'StringParameterValue', name: 'changeURL', value: changeURL],
        ],
        wait: false
    )
}
