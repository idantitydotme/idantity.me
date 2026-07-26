import { Hono } from "hono"
import versionList from "./list"
import versionActions from "./actions"

const api = new Hono()

api.route("/", versionList)
api.route("/", versionActions)

export default api
