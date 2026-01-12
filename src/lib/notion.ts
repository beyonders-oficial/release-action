import { Client } from '@notionhq/client'
import {
  NOTION_API_KEY,
  NOTION_GITHUB_DATABASE_ID
} from '../config/constants.js'
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints.js'

const notion = new Client({ auth: NOTION_API_KEY })

export const getDatabases = async () => {
  return await notion.search({
    filter: {
      value: 'database',
      property: 'object'
    }
  })
}

/**
 * Retrieves tasks from a Notion database that are ready for release.
 *
 * The function queries the specified Notion database and filters tasks based on the following criteria:
 * - The "Status" property must be set to "Staging".
 * - The "Test status" property must be either "Testado" or "Tested".
 * - The "Repository" property must contain the specified repository name
 *
 * @async
 * @function getTasksReadyForRelease
 * @returns {Promise<Object>} A promise that resolves to the query result containing tasks ready for release.
 * @throws {Error} Throws an error if the Notion API query fails.
 */
export const getTasksReadyForRelease = async ({
  databaseId,
  repository
}: {
  databaseId: string
  repository: string
}) => {
  return await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Status',
          type: 'status',
          status: {
            equals: 'Staging'
          }
        },
        {
          or: [
            {
              property: 'Test status',
              type: 'select',
              select: {
                equals: 'Testado'
              }
            },
            {
              property: 'Test status',
              type: 'select',
              select: {
                equals: 'Tested'
              }
            }
          ]
        },
        {
          property: 'Repository',
          select: {
            equals: repository
          }
        }
      ]
    }
  })
}

type UpdatePageVersionParams = {
  pageId: string
  newVersion: string
}
/**
 * Updates the version and status of a Notion page.
 *
 * @param {UpdatePageVersionParams} params - The parameters for updating the page.
 * @param {string} params.newVersion - The new version to set in the "Release" property of the page.
 * @param {string} params.pageId - The ID of the Notion page to update.
 * @returns {Promise<string>} A promise that resolves to the ID of the updated page.
 *
 * @throws {Error} Throws an error if the Notion API request fails.
 */
export const updateNotionPageVersion = async ({
  newVersion,
  pageId
}: UpdatePageVersionParams) => {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: {
        status: {
          name: 'Done'
        }
      },
      Release: {
        select: {
          name: newVersion
        }
      }
    }
  })
  return response.id
}

export interface NotionDatabaseRow {
  [key: string]: string
}

/**
 * This function makes a query to one of our Notion databases that store
 * our projects details, like:
 * - Name
 * - Github Repository
 * - Github Owner
 * - Notion Kanbam Database ID
 *
 * @param params {Object} optional params to filter the database
 * @returns NotionDatabaseRow
 */
export const getProjectsInformation = async (params?: {
  databaseId: string
  project: string
}): Promise<NotionDatabaseRow[]> => {
  const queryArgs: QueryDatabaseParameters = {
    database_id: NOTION_GITHUB_DATABASE_ID // Constant Database ID
  }

  if (params) {
    queryArgs.filter = {
      and: []
    }
    if (params.databaseId) {
      queryArgs.filter.and.push({
        property: 'Database Notion ID',
        rich_text: { equals: params.databaseId.split('-').join('') }
      })
    }
    if (params.project) {
      queryArgs.filter.and.push({
        property: 'Project',
        rich_text: { equals: params.project }
      })
    }
  }

  const data = await notion.databases.query(queryArgs)
  return data.results
    .filter((r) => r.object === 'page')
    .map((result) => {
      const row: NotionDatabaseRow = {}
      if ('properties' in result && result.properties) {
        const keys = Object.keys(result.properties)
        for (const key of keys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const property = result.properties[key] as any
          if (
            property?.rich_text &&
            property.rich_text.length > 0 &&
            property.rich_text[0]?.text?.content
          ) {
            row[key] = property.rich_text[0].text.content
          } else if (property?.type === 'select' && !!property?.select?.name) {
            row[key] = property.select.name
          } else if (
            property?.title &&
            property.title.length > 0 &&
            property?.title[0]?.plain_text
          ) {
            row[key] = property?.title[0]?.plain_text
          } else {
            row[key] = ''
          }
        }
      }
      return row
    })
}
