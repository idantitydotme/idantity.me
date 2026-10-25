import { pageRoutes } from "virtual:file-routes";
import { fileRoutes } from "@solidjs/router/fs";
import { createRouter } from "@solidjs/router";
import { Loading } from "solid-js";
import { RLErrorBoundary } from "@rimelight/ui";

const Router = createRouter({ routes: fileRoutes(pageRoutes) });

export default function App() {
  return (
    <Router>
      {(props) => (
        <RLErrorBoundary resetKey={props.location.pathname}>
          <Loading
            fallback={<main class="min-h-screen flex items-center justify-center">Loading.</main>}
          >
            {props.children}
          </Loading>
        </RLErrorBoundary>
      )}
    </Router>
  );
}
