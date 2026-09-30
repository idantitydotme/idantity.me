import type { Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import AppError from "#components/app/AppError";

export const Error403Page: Component = () => {
  return (
    <AppLayout
      title="403 - Access Denied"
      description="Your account does not have administrator privileges required to access this page."
      noindex={true}
    >
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
    </AppLayout>
  );
};

export default Error403Page;
