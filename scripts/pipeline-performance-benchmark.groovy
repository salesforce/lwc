GITHUB_STATUS_CONTEXT = "continuous-integration/jenkins/performance"
BENCHMARKING_ARTEFACT_PAGE = "https://git.soma.salesforce.com/pages/raptor/benchmark-artefacts/"

def helpers
def prInfo

node("private-cloud") {
    if (!params.base || !params.compare || !params.changeURL) {
        error("Job expects all base, compare and changeURL params to be set")
    }

    stage("Git Clone") {
        checkout scm

        helpers = load("scripts/pipeline-helpers.groovy")
        prInfo = helpers.extractChangeURLInfo(params.changeURL)
    }

    try {
        stage("Setup") {
            // Set pending benchmark status on github
            helpers.postStatusOnCommit(prInfo, params.compare, [
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
                def baseUrl = BENCHMARKING_ARTEFACT_PAGE + params.base.take(7)
                def compareUrl = BENCHMARKING_ARTEFACT_PAGE + params.compare.take(7)
                sh "npm run cli -- --timeout=900000 --browser=chrome --base=$baseUrl --compare=$compareUrl --reporter=markdown --dest=../results.md"
            }
        }

        stage("Publish") {
            // Replace previous performance result table with the updated one
            helpers.deletedPreviousComments(prInfo)
            helpers.commentOnIssue(prInfo, readFile('./results.md'))

            // Notify github that the build is successful
            helpers.postStatusOnCommit(prInfo, params.compare, [
                state: "success",
                description: "Successfull benchmark run",
                context: GITHUB_STATUS_CONTEXT
            ])
        }
    } catch (e) {
        // Indicate that the build is failed
        helpers.postStatusOnCommit(prInfo, params.compare, [
            state: "failure",
            description: "Failed to run benchmark",
            context: GITHUB_STATUS_CONTEXT
        ])

        throw e
    }
}
