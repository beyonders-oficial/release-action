/**
 * Auto detects next version based on task labels.
 *
 * @param {string} latestTag The current latest version tag, e.g., 'v1.3.2'
 * @param {Array} doneTasks The list of tasks, each with a 'category' string
 * @returns {string} The next version tag, e.g., 'v1.4.0' or 'v2.0.0'
 */
export function autoDetectNextVersion(latestTag: string, doneTasks: string[]) {
  let [major, minor, patch] = latestTag.replace(/^v/, '').split('.').map(Number)

  let bumpMajor = false
  let bumpMinor = false

  for (const taskCategory of doneTasks) {
    const category = taskCategory.toLowerCase()

    if (category.includes('breaking')) {
      bumpMajor = true
      break // breaking change always wins
    }
    if (category.includes('feature')) {
      bumpMinor = true
    }
    // Bug fixes and small stuff = default patch bump
  }

  if (bumpMajor) {
    major += 1
    minor = 0
    patch = 0
  } else if (bumpMinor) {
    minor += 1
    patch = 0
  } else {
    patch += 1
  }

  return `${major}.${minor}.${patch}`
}
