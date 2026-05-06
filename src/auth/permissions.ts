import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc
} from "better-auth/plugins/organization/access"

export const statement = {
  ...defaultStatements,
  organization: ["create", "edit", "delete"],
  team: ["create", "edit", "delete"],
  member: ["create", "edit", "delete"],
  invitation: ["create", "delete"],
  project: ["create", "edit", "delete"],
  asset: ["view", "create", "edit", "delete"],
  blogPost: ["create", "edit", "review", "delete"],
  legal: ["create", "edit", "review", "delete"]
} as const

export const ac = createAccessControl(statement)

export const owner = ac.newRole({
  ...ownerAc.statements,
  organization: ["create", "edit", "delete"],
  team: ["create", "edit", "delete"],
  member: ["create", "edit", "delete"],
  invitation: ["create", "delete"],
  project: ["create", "edit", "delete"],
  asset: ["view", "create", "edit", "delete"],
  blogPost: ["create", "edit", "review", "delete"],
  legal: ["create", "edit", "review", "delete"]
})

export const admin = ac.newRole({
  ...adminAc.statements,
  organization: [],
  team: ["create", "edit", "delete"],
  member: ["create", "edit", "delete"],
  invitation: ["create", "delete"],
  project: ["create", "edit", "delete"],
  asset: ["view", "create", "edit", "delete"],
  blogPost: ["create", "edit", "review", "delete"],
  legal: ["create", "edit", "review", "delete"]
})

export const member = ac.newRole({
  ...memberAc.statements,
  organization: [],
  team: [],
  member: [],
  invitation: [],
  project: ["create", "edit", "delete"],
  asset: ["view", "create", "edit", "delete"],
  blogPost: ["create", "edit", "review", "delete"],
  legal: ["create", "edit", "review", "delete"]
})

export const user = ac.newRole({
  organization: [],
  team: [],
  member: [],
  invitation: [],
  project: [],
  asset: [],
  blogPost: [],
  legal: []
})
