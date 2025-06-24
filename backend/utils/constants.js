const httpMethods = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PUT: 'PUT'
}

const httpStatusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
}

const folderPaths = {
    DATABASE: './databases'
}

const fileExtensions = {
    JSON: '.json'
}

module.exports = { httpMethods, httpStatusCodes, folderPaths, fileExtensions } 