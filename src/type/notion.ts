export interface PageProperties {
  'Test status': TestStatus
  'Last edited time': LastEditedTime
  'Tester(s)': TesterS
  Assign: Assign
  Stories: Stories
  Dependency: Dependency
  'Created at': CreatedAt
  Issuer: Issuer
  Category: Category
  Prototypes: Prototypes
  PR: Pr
  Epic: Epic
  Release: Release
  ID: Id
  Priority: Priority
  Status: Status
  Name: Name
  'PR Reviewer': PrReviewer
  Project: Project
}

export interface TestStatus {
  id: string
  type: string
  select: Select
}

export interface Select {
  id: string
  name: string
  color: string
}

export interface LastEditedTime {
  id: string
  type: string
  last_edited_time: string
}

export interface TesterS {
  id: string
  type: string
  people: People[]
}

export interface People {
  object: string
  id: string
  name: string
  avatar_url: string | undefined
  type: string
  person: Person
}

export interface Person {
  email: string
}

export interface Assign {
  id: string
  type: string
  people: People2[]
}

export interface People2 {
  object: string
  id: string
  name: string
  avatar_url: string
  type: string
  person: Person2
}

export interface Person2 {
  email: string
}

export interface Stories {
  id: string
  type: string
  relation: string | undefined[]
  has_more: boolean
}

export interface Dependency {
  id: string
  type: string
  relation: string | undefined[]
  has_more: boolean
}

export interface CreatedAt {
  id: string
  type: string
  created_time: string
}

export interface Issuer {
  id: string
  type: string
  created_by: CreatedBy
}

export interface CreatedBy {
  object: string
  id: string
  name: string
  avatar_url: string | undefined
  type: string
  person: Person3
}

export interface Person3 {
  email: string
}

export interface Category {
  id: string
  type: string
  select: Select2
}

export interface Select2 {
  id: string
  name: string
  color: string
}

export interface Prototypes {
  id: string
  type: string
  relation: string | undefined[]
  has_more: boolean
}

export interface Pr {
  id: string
  type: string
  relation: Relation[]
  has_more: boolean
}

export interface Relation {
  id: string
}

export interface Epic {
  id: string
  type: string
  relation: string | undefined[]
  has_more: boolean
}

export interface Release {
  id: string
  type: string
  select: string | undefined
}

export interface Id {
  id: string
  type: string
  unique_id: UniqueId
}

export interface UniqueId {
  prefix: string
  number: number
}

export interface Priority {
  id: string
  type: string
  select: Select3
}

export interface Select3 {
  id: string
  name: string
  color: string
}

export interface Status {
  id: string
  type: string
  status: Status2
}

export interface Status2 {
  id: string
  name: string
  color: string
}

export interface Name {
  id: string
  type: string
  title: Title[]
}

export interface Title {
  type: string
  text: Text
  annotations: Annotations
  plain_text: string
  href: string | undefined
}

export interface Text {
  content: string
  link: string | undefined
}

export interface Annotations {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  underline: boolean
  code: boolean
  color: string
}

export interface PrReviewer {
  id: string
  type: string
  people: string | undefined[]
}

export interface Project {
  id: string
  type: string
  multi_select: MultiSelect[]
}

export interface MultiSelect {
  id: string
  name: string
  color: string
}
