import { Hono } from "hono"
import pagesList from "./list"
import pagesRead from "./read"
import pagesCreate from "./create"
import pagesUpdate from "./update"
import pagesPublish from "./publish"
import pagesUnpublish from "./unpublish"
import pagesDelete from "./delete"

const api = new Hono()

api.route("/", pagesList)
api.route("/", pagesRead)
api.route("/", pagesCreate)
api.route("/", pagesUpdate)
api.route("/", pagesPublish)
api.route("/", pagesUnpublish)
api.route("/", pagesDelete)

export default api
