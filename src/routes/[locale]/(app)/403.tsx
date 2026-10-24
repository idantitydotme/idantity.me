import type { Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppError from "#components/app/AppError";

export const Error403Page: Component = () => {
  useHead(() =>
    createSeoHead({
      title: "403 - Access Denied",
      description:
        "Your account does not have administrator privileges required to access this page.",
      noindex: true,
    }),
  );

  return (
    <AppError
      code={403}
      title="Access Denied"
      description="Your account does not have administrator privileges required to access this page."
      requiredRole="admin"
      actions={[
        {
          label: "Go to Home Page",
          href: "/",
          variant: "solid",
          color: "primary",
          icon: "i-lucide-home",
        },
      ]}
    />
  );
};

export default Error403Page;
