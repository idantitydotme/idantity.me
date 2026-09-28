import type { Component } from "solid-js"
import AppLayout from "#layouts/AppLayout"
import AppError from "#components/app/AppError"

export const Error401Page: Component = () => {
  return (
    <AppLayout
      title="401 - Authentication Required"
      description="You must be signed in to access this page."
      noindex={true}
    >
      <AppError
        code={401}
        title="Authentication Required"
        description="You must be signed in to access this page."
        actions={[
          {
            label: "Go to Home Page",
            href: "/",
            variant: "solid",
            color: "primary",
            icon: "i-lucide-home"
          }
        ]}
      />
    </AppLayout>
  )
}

export default Error401Page
