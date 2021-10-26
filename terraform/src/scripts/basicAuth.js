function handler(event) {
  var request = event.request;
  var auth =
    request.headers.authorization && request.headers.authorization.value;

  var response401 = {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: {
      "www-authenticate": {
        value: "Basic",
      },
    },
  };

  var authUser = "${auth_user}";
  var authPass = "${auth_pass}";
  var authString = "Basic " + (authUser + ":" + authPass).toString("base64");

  if (!auth || !auth.startsWith("Basic ")) {
    return response401;
  }

  if (auth !== authString) {
    return response401;
  }

  return request;
}
