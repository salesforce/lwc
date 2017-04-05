import groovy.json.JsonSlurper
import groovy.json.JsonOutput

// Note added to all the comments issued by the bot
BOT_SIGNATURE = '> CI Bot'

@NonCPS
def jsonParse(def json) {
    final slurper = new JsonSlurper()
    return slurper.parseText(json)
}

// Send an authenticated request to the the Github Enterprise API
def requestGithub(path, method='GET', data=null) {
    def methodParam = '-X ' + method
    def url = 'https://git.soma.salesforce.com/api/v3' + path

    def authParam = ''
    withCredentials([usernamePassword(
        credentialsId: '3edc1330-3350-47ea-8fa6-3f7ce040013a',
        passwordVariable: 'token',
        usernameVariable: 'username'
    )]) {
        authParam = '-H "Authorization: token ' + token + '"'
    }

    def dataParam = ''
    if (data) {
        dataParam = '-d \'' +  data + '\''
    }

    def command = [
        'curl',
        '--fail',
        methodParam,
        authParam,
        dataParam,
        url
    ].join(' ')

    return sh(returnStdout: true, script: command)
}

// Send a comment on a specific issue or pull request
def commentOnIssue(prInfo, content) {
    def payload = JsonOutput.toJson([
        body: content + "\n" + BOT_SIGNATURE
    ])

    return requestGithub(
        "/repos/$prInfo.owner/$prInfo.repo/issues/$prInfo.issueId/comments",
        'POST',
        payload
    )
}

def postStatusOnCommit(prInfo, commit, status) {
    def payload = JsonOutput.toJson([
        state: status.state,
        target_url: env.BUILD_URL,
        description: status.description,
        context: status.context
    ])

    return requestGithub(
        "/repos/$prInfo.owner/$prInfo.repo/statuses/$commit",
        'POST',
        payload
    )
}

// Delete all the previous posts
def deletedPreviousComments(prInfo) {
    def comments = jsonParse(requestGithub("/repos/$prInfo.owner/$prInfo.repo/issues/$prInfo.issueId/comments"))
    def deleteRequests = []

    for (i = 0; i < comments.size(); i++) {
        def comment = comments[i]
        if(comment.body.contains(BOT_SIGNATURE)) {
            req = requestGithub(
                "/repos/$prInfo.owner/$prInfo.repo/issues/comments/$comment.id",
                'DELETE'
            )

            deleteRequests.push(req)
        }
    }

    return deleteRequests
}

// TODO - yarn has a race condition. running it a second time solves the issue and it doesn't redownloaded everything.
// it's ugly but it works. see https://github.com/yarnpkg/yarn/issues/820.
def yarnInstall() {
    sh "yarn install || yarn install"
}

// Extract owner repo and issueId from from the issue extractChangeURL
// changeURL have the following format: "https://git.soma.salesforce.com/<owner>/<repo>/pull/<issueId>"
def extractChangeURLInfo(changeURL) {
    def splittedURL = changeURL.split("/")

    if (splittedURL.length != 7) {
        error("changeURL doesn't have the right format $changeURL")
    }

    return [
        owner: splittedURL[splittedURL.length - 4],
        repo: splittedURL[splittedURL.length - 3],
        issueId: splittedURL[splittedURL.length - 1],
    ]
}

// Return the commit hash referenced by the revision specifier
// Note: Because Jenkins is taking care of merging the branches, it requires some trick to get the actual commit hash.
def getCommitHash(String revisionSpecifier, boolean shortFormat=false) {
    def gitCommit = sh(
        returnStdout: true,
        script: "git rev-parse $revisionSpecifier"
    ).trim()

    return shortFormat ?
        gitCommit.take(7) :
        gitCommit
}

// Returns true job triggered by a commit on master
def isMaster() {
    return env.BRANCH_NAME == "master"
}

// Returns true if job trigered by a PR change.
def isPullRequest() {
    return env.CHANGE_ID != null
}

return this
