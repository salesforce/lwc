GITHUB_STATUS_CONTEXT = "continuous-integration/jenkins/performance"
BENCHMARKING_ARTEFACT_PAGE = "https://git.soma.salesforce.com/pages/raptor/benchmark-artefacts/"

def helpers
def prInfo

node("private-cloud") {
    if (!params.baseBranch || !params.compareCommit || !params.changeURL) {
        error("Job expects all baseBranch, compareCommit and changeURL params to be set")
    }

    stage("Git Clone") {
        checkout scm

        helpers = load("scripts/pipeline-helpers.groovy")
        prInfo = helpers.extractChangeURLInfo(params.changeURL)
    }

    try {
        stage("Setup") {
            // Set pending benchmark status on github
            helpers.postStatusOnCommit(prInfo, params.compareCommit, [
                state: "pending",
                description: "Running performance benchmarks",
                context: GITHUB_STATUS_CONTEXT
            ])

            // Install dependencies
            helpers.yarnInstall()

            // Build runner
            dir("benchmarking") {
                helpers.yarnInstall()
                sh "yarn run link && yarn run build-runner"
            }
        }

        stage("Benchmark") {
            // Run the actual performance benchmark
            dir("benchmarking") {
                // Because this job can be triggered before the benchmark bundle for the lastest commit on the target branch is built,
                // we need to get the lastest commit that triggered a sucessfull performance benchmark build.
                def baseCommitHash = findLastestBenchmarkOnBranch(params.baseBranch)

                def baseUrl = BENCHMARKING_ARTEFACT_PAGE + baseCommitHash
                def compareUrl = BENCHMARKING_ARTEFACT_PAGE + params.compareCommit.take(7)
                sh "npm run cli -- --timeout=900000 --browser=chrome --base=$baseUrl --compare=$compareUrl --reporter=markdown --dest=../results.md"
            }
        }

        stage("Publish") {
            // Replace previous performance result table with the updated one
            helpers.deletedPreviousComments(prInfo)
            helpers.commentOnIssue(prInfo, readFile('./results.md'))

            // Notify github that the build is successful
            helpers.postStatusOnCommit(prInfo, params.compareCommit, [
                state: "success",
                description: "Successfull benchmark run",
                context: GITHUB_STATUS_CONTEXT
            ])
        }
    } catch (e) {
        // Indicate that the build is failed
        helpers.postStatusOnCommit(prInfo, params.compareCommit, [
            state: "failure",
            description: "Failed to run benchmark: $e",
            context: GITHUB_STATUS_CONTEXT
        ])

        throw e
    }
}

// Returns the lastest commit that has a benchmark bundle associated with for
// a specific branch.
def findLastestBenchmarkOnBranch(branchName) {
    // List the previous commit hash on the branch name passed as parameter
    def targetBranchCommits = sh (
        script: "git log --format='%h' -30 $branchName",
        returnStdout: true
    ).split("\n")

    def targetCommit;
    def index = 0;

    while(!targetCommit && index < targetBranchCommits.length) {
        def bundleUrl = BENCHMARKING_ARTEFACT_PAGE + targetBranchCommits[index] + "/info.json"
        def curlResponse = sh(script: "curl -I $bundleUrl", returnStdout: true)

        // Check if the benchmark registery has the bundle for the commit hash
        if (curlResponse.contains("200 OK")) {
            targetCommit = targetBranchCommits[index];
        }

        index++;
    }

    // Fails the performance benchmark if no commit hash is present
    if (!targetCommit) {
        error("No bundle benchmark bundle available");
    }

    return targetCommit;
}
