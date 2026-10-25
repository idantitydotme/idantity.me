import type { Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLError } from "@rimelight/ui";

export const Error404Page: Component = () => {
  useHead(() => createSeoHead({ is404: true }));

  return <RLError status={404} />;
};

export default Error404Page;
