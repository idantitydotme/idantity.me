import { Hono } from "hono"
import assetsGet from "./get"
import assetsPut from "./put"
import assetsDelete from "./delete"
import assetsMove from "./move"

const api = new Hono()

api.route("/", assetsGet)
api.route("/", assetsPut)
api.route("/", assetsDelete)
api.route("/", assetsMove)

export default api
