import { getOctokit } from '@actions/github'
import { GITHUB_TOKEN, REPOSITORY_NAME } from '../config/constants.js'
import { autoDetectNextVersion } from './semver.js'

const octokit = getOctokit(GITHUB_TOKEN ?? '')

type Params = {
  changeLog: string
  categories: string[]
}
export const createGithubRelease = async ({
  changeLog,
  categories
}: Params) => {
  const [owner, repoName] = (REPOSITORY_NAME || '').split('/')
  const latestRelease = await octokit.rest.repos.getLatestRelease({
    owner,
    repo: repoName
  })
  const latestTag = latestRelease.data.tag_name

  const nextTag = autoDetectNextVersion(latestTag, categories)

  await octokit.rest.repos.createRelease({
    owner,
    repo: repoName,
    tag_name: nextTag,
    name: `v${nextTag} (${new Date().toDateString()})`,
    body: changeLog,
    draft: true,
    prerelease: false
  })

  return nextTag
}
