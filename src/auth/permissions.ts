import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc
} from "better-auth/plugins/organization/access"

export const statement = {
  ...defaultStatements,
  blogPost: ["create", "update", "review", "delete"],
  legal: ["create", "update", "review", "delete"]
} as const

export const ac = createAccessControl(statement)

export const owner = ac.newRole({
  blogPost: ["create", "update", "review", "delete"],
  legal: ["create", "update", "review", "delete"],
  ...ownerAc.statements
})

export const admin = ac.newRole({
  blogPost: ["create", "update", "review", "delete"],
  legal: ["create", "update", "review", "delete"],
  ...adminAc.statements
})

export const member = ac.newRole({
  ...memberAc.statements
})

export const user = ac.newRole({
  blogPost: [],
  legal: []
})
