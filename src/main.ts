import * as core from '@actions/core'
import { createGithubRelease, publishGithubRelease } from './lib/github.js'
import {
  getDatabases,
  getTasksReadyForRelease,
  updateNotionPageVersion
} from './lib/notion.js'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints.js'
import { PageProperties } from './types/notion.js'
import { getGithubUserFromNotionUser } from './lib/map.js'

type SearchResult = {
  title: { plain_text: string }[]
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const project = core.getInput('project')
    const repoCategory = core.getInput('repo-category')
    const databases = await getDatabases()

    const selectedDatabase = databases.results.find(
      (db) =>
        db.object === 'database' &&
        typeof (db as SearchResult).title[0].plain_text === 'string' &&
        (db as SearchResult).title[0].plain_text
          .toLowerCase()
          .indexOf('tasks') > -1 &&
        (db as SearchResult).title[0].plain_text
          .toLowerCase()
          .indexOf(project) > -1
    )
    if (!selectedDatabase) throw new Error('Database not found')

    const response = await getTasksReadyForRelease({
      databaseId: selectedDatabase.id,
      repoCategory
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
    // core.setOutput('new-version', newVersion)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
