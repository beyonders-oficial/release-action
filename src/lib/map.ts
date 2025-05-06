const NOTION_TO_GITHUB_USERS: { [name: string]: string } = {
  'Kaio Gabriel Souza Rozini': 'KaioGabrielSouzaRozini',
  'Pedro Epifanio': 'pedroepif',
  'Kelly Martina': 'kellymartina',
  'Igor Benedet': 'IgorB20',
  Lucas: 'lucas-oruncode',
  Mathgobbo: 'Mathgobbo'
}

export const getGithubUserFromNotionUser = (notionUser: string) => {
  const user = NOTION_TO_GITHUB_USERS[notionUser]
  if (!user) return 'Unknown'
  return user
}
