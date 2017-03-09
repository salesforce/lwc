// must specify the CloudBees docker label which maps to the appropriate docker image
// aka do not change this.
node("raptor_node") {
    // CloudBees Nexus mirror
    def NEXUS = "https://nexus.ci.data.com/nexus/content/groups/npm-all/"

    try {
        // CloudBees reports each stage separately providing us with visibility into
        // run time and failure at a glance

        stage("Git Clone") {
            // checkout according to jenkins project config (eg git clone + git checkout)
            checkout scm
        }

        stage("Environment Setup") {
            // copy credential files into the docker image
            withCredentials([file(credentialsId: 'team-auraframework_nexus-token', variable: 'NPMRC')]) {
                sh "cp $NPMRC ~/.npmrc"
            }
        }

        stage("Build") {
            // leave verbose on for a few weeks to aid log debugging
            sh "npm --verbose --registry=$NEXUS  install"
        }

        stage("Static Analysis") {
            // TODO - when flow errors are fixed change this to "npm run lint"
            sh "npm run lint"
        }

        stage("Test") {
            sh "npm test"
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
