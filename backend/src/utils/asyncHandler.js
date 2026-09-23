/**
 * Wraps an async route handler to catch any errors and forward them to Express error middleware.
 * @param {Function} requestHandler - Async controller function (req, res, next)
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }
export default asyncHandler
