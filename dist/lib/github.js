import { context, getOctokit } from '@actions/github';
import { GITHUB_TOKEN, REPOSITORY_NAME } from '../config/constants.js';
import { autoDetectNextVersion } from './semver.js';
const octokit = getOctokit(GITHUB_TOKEN ?? '');
export const createGithubRelease = async ({ changeLog, categories }) => {
    const [owner, repoName] = (REPOSITORY_NAME || '').split('/');
    let nextTag;
    try {
        const latestRelease = await octokit.rest.repos.getLatestRelease({
            owner,
            repo: repoName
        });
        const latestTag = latestRelease.data.tag_name;
        nextTag = autoDetectNextVersion(latestTag, categories);
    }
    catch (error) {
        if (error instanceof Error &&
            error.name === 'HttpError' &&
            error.status === 404) {
            nextTag = '1.0.0';
        }
        else
            throw error;
    }
    const release = await octokit.rest.repos.createRelease({
        owner,
        repo: repoName,
        tag_name: nextTag,
        name: `v${nextTag} (${new Date().toDateString()})`,
        body: changeLog,
        draft: true,
        prerelease: false
    });
    return { newVersion: nextTag, releaseId: release.data.id };
};
export const publishGithubRelease = async (releaseId) => {
    const [owner, repoName] = (REPOSITORY_NAME || '').split('/');
    const { data } = await octokit.rest.repos.updateRelease({
        owner,
        repo: repoName,
        release_id: releaseId,
        draft: false
    });
    return data.html_url;
};
export const getRepoInfo = () => {
    return context.repo;
};
