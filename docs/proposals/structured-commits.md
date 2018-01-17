### Standardizing Git Commits

This proposal lays down the groundwork for auto-generated changelog. Before we begin working on changelog functionality, we must tackle inconsistencies between commit styles, which make it difficult to read through the commit history and changelog/release notes in the future. To fix that, we need to solidify existing commit process by introducing well defined format to our commit messages. Having standardized structure will allow us to generated clean, easy to read and follow list of changes.

#### Approaches:

1. **Semantic commit** - is an interactive commit process that prompts developers to answer question regarding committed work which are then used to auto-generates well structured commit message.
The prompts ask for type, scope, short description, long description and breaking changes. “Type” specifies the category of the commit (chore, feat, fix, etc.). “Scope” refers to the group of files changed. “Short description” is the description that goes into the first line of the commit. “Long description” is a multiline description that starts on the second line of the commit. “Breaking changes” follows the long description in the commit message. The tool that provides such functionality is called [commitizen cz-cli](https://github.com/commitizen/cz-cli). I created [public repo](https://git.soma.salesforce.com/apapko/changelog) that utilizes above-mentioned functionality. Please feel free to clone it and commit test changes to experience interactive commits by calling: **git cz** after adding your files<img width="750" src="https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png">


2. **Pre-commit hook** - use tools such as [husky](https://github.com/typicode/husky) to intercept commit command and validate its message format. If message is not valid, user will be prompted with the descriptive error message. This can be accomplished with commitlint tool. <img width="750" src="https://marionebl.github.io/commitlint/assets/commitlint.svg">


3. **Pull Request Git Template** -  to be used as a top level entry during 'squash and merge' step of the pull request. Depending on the project and work style, developers may have large number of commits prior merging into master, which can make it tedious to have to go through interactive commit on every single submission. In this case,  the proposal is to create a git template that developer has to fill out in the 'comment' section of the pull request. This template will force structured commit message that will later be used for changelog generation.


####  My Proposal:
Combination of 1 and 2: Use semantic commit ( option 1 ) for every commit via 'git cz' command. In addition, use pre-commit hook ( option 2 ) to catch commits that were not submitted with 'git cz' and validate its message format. Having both options enabled will guarantee that no matter how commit has been submitted, its message will always have consistent format.

#### Thoughts
Each approach has its pros and cons. Here are some question that we should consider while choosing on the approach:
- Do we value consistency in our commit history and are willing to sacrifice some dev time for it
- Do we want to force formatted commit on every commit?
- Do we want formatted commits even though some of them won't be used during squash and merge?


