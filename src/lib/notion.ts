import { Client } from '@notionhq/client'
import { NOTION_API_KEY } from '../config/constants.js'

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
 * - The "Project" property must contain the specified repository name (`repo`) or its lowercase equivalent.
 *
 * @async
 * @function getTasksReadyForRelease
 * @returns {Promise<Object>} A promise that resolves to the query result containing tasks ready for release.
 * @throws {Error} Throws an error if the Notion API query fails.
 */
export const getTasksReadyForRelease = async ({
  databaseId,
  repoCategory
}: {
  databaseId: string
  repoCategory: string
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
          or: [
            {
              property: 'Project',
              type: 'multi_select',
              multi_select: {
                contains: repoCategory
              }
            },
            {
              property: 'Project',
              type: 'multi_select',
              multi_select: {
                contains: repoCategory.toLowerCase()
              }
            }
          ]
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
