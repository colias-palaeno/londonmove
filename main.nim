import jester # lightweight web framework written in Nim. using it for routing
, strutils

routes:
  error {Http401 .. Http504}:
    resp(readFile("public/error.html"))
  get "/":
    resp(readFile("public/index.html"))
  get "/about":
    resp(readFile("public/about.html"))
  get "/search":
    resp(readFile("public/search.html"))
  post "/search":
    redirect "/search/" & request.params["location"].toLowerAscii().replace(" ", "-")
  get "/search/@location":
    resp(readFile("public/submitted.html"))