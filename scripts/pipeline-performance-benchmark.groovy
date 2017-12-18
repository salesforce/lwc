GITHUB_STATUS_CONTEXT = "continuous-integration/jenkins/performance"
BENCHMARKING_ARTEFACT_PAGE = "https://git.soma.salesforce.com/pages/lwc/benchmark-artifacts"

BENCHMARK_BROWSER_NAME = "chrome"
BENCHMARK_TIMEOUT = 30 * 60 * 1000

helpers = null
prInfo = null

if (!params.baseBranch || !params.compareCommit || !params.changeURL) {
    error("Job expects all baseBranch, compareCommit and changeURL params to be set")
}

node("private-cloud") {
    stage("Git Clone") {
        checkout scm

        helpers = load("scripts/pipeline-helpers.groovy")
        prInfo = helpers.extractChangeURLInfo(params.changeURL)
    }

    try {
        stage("Setup") {
            // Set pending benchmark status on github
            postGitStatus()
            helpers.yarnInstall()
        }

        stage("Benchmark") {
            // Run the actual performance benchmark
            dir("packages/benchmark") {
                def baseCommitHash = findLastestBenchmarkOnBranch(params.baseBranch)
                def compareCommitHash = params.compareCommit.take(7)

                def baseUrl = "$BENCHMARKING_ARTEFACT_PAGE/$baseCommitHash"
                def compareUrl = "$BENCHMARKING_ARTEFACT_PAGE/$compareCommitHash"

                try {
                    sh """
                        yarn start -- \
                            --timeout=$BENCHMARK_TIMEOUT \
                            --browser=$BENCHMARK_BROWSER_NAME \
                            --server=$compareUrl \
                            --base=$baseUrl \
                            --compare=$compareUrl \
                            --reporter=markdown \
                            --dest=../../results.md
                    """
                    currentBuild.result = "SUCCESS"
                } catch (e) {
                    currentBuild.result = "FAILURE"
                }
            }
        }

        stage("Publish") {
            helpers.deletedPreviousComments(prInfo)
            helpers.commentOnIssue(prInfo, readFile('./results.md'))
        }
    } finally {
        // Make sure to update the github status before exiting
        postGitStatus()
    }
}

// Returns the lastest commit that has a benchmark bundle associated with for
// a specific branch.
def findLastestBenchmarkOnBranch(branchName) {
    for (i = 0; true; i++) {
        // Get previous commit hash
        def nextCommit = sh (
            script: "git log --format='%h' -1 $branchName~$i",
            returnStdout: true
        ).trim()

        // Rquest the bundle info from the repository
        def curlResponse = sh(
            script: "curl -sS -I $BENCHMARKING_ARTEFACT_PAGE/$nextCommit/info.json",
            returnStdout: true
        )

        // Check if the benchmark registery has the bundle for the commit hash
        if (curlResponse.contains("200 OK")) {
            return nextCommit;
        }
    }
}

def postGitStatus() {
    def state = currentBuild.result ? currentBuild.result.toLowerCase() : "pending"

    helpers.postStatusOnCommit(prInfo, params.compareCommit, [
        state: state,
        description: "Performance testing status: " + state,
        context: GITHUB_STATUS_CONTEXT
    ])
}
