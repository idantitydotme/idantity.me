import { experimental_AstroContainer as AstroContainer } from "astro/container"
import ContactEmail from "#components/email/ContactEmail.astro"

const container = AstroContainer.create()

export async function renderContactEmail(props: {
  name: string
  email: string
  subject?: string | undefined
  message: string
}) {
  return (await container).renderToString(ContactEmail, {
    props
  })
}
