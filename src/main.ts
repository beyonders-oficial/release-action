import * as core from '@actions/core'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints.js'
import {
  createGithubRelease,
  getRepoInfo,
  publishGithubRelease
} from './lib/github.js'
import { getGithubUserFromNotionUser } from './lib/map.js'
import {
  getProjectsInformation,
  getTasksReadyForRelease,
  updateNotionPageVersion
} from './lib/notion.js'
import { PageProperties } from './types/notion.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const repoInfo = getRepoInfo()
    const projectsInfo = await getProjectsInformation()

    const selectedProject = projectsInfo.find(
      (row) =>
        row['Github Owner'] == repoInfo.owner &&
        row['Github Repo'] == repoInfo.repo
    )
    if (!selectedProject)
      throw new Error('Project and/or repo not Notion-Github Database yet')

    const selectedDatabase = selectedProject['Database Notion ID']
    if (!selectedDatabase)
      throw new Error('Notion Database for this project not found')

    const selectedTitle = selectedProject['Title']
    if (!selectedTitle) throw new Error('Title not found')

    const response = await getTasksReadyForRelease({
      databaseId: selectedDatabase,
      repository: repoInfo.repo
    })

    if (!response.results.length) throw new Error('No Tasks found.')

    const doneTasks = []
    const tasksCategories = []
    for (const page of response.results) {
      const url = (page as { url: string }).url

      const properties = (page as DatabaseObjectResponse)
        .properties as unknown as PageProperties
      core.debug(JSON.stringify(properties))
      const idObject = properties['ID'].unique_id
      const id = idObject.prefix + '-' + idObject.number
      const developers = properties['Assign'].people
        .map((person) => '@' + getGithubUserFromNotionUser(person?.name))
        .join(', ')

      tasksCategories.push(properties['Category'].select?.name)
      doneTasks.push(
        `- [${id}](${url}): ${properties['Name'].title[0].text.content} by ${developers} (${properties['Category'].select.name})`
      )
    }

    const changelog = `## What's new \n ${doneTasks.join('\n')}`

    const { newVersion, releaseId } = await createGithubRelease({
      categories: tasksCategories,
      changeLog: changelog
    })

    for (const page of response.results)
      await updateNotionPageVersion({
        newVersion,
        pageId: page.id
      })

    await publishGithubRelease(releaseId)

    core.setOutput('new-version', newVersion)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
