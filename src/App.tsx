import { Router } from "./router";

export default function App() {
  return <Router>{(props) => props.children}</Router>;
}
