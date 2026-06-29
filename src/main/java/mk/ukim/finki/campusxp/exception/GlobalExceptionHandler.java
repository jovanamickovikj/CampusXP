package mk.ukim.finki.campusxp.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handling for all controllers.
 * Returns consistent JSON error responses: { status, error, message, timestamp }.
 * Validation errors additionally include a "fieldErrors" map.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Bean Validation failure (@Valid on request bodies). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (first, second) -> first   // keep first error per field
                ));
        log.debug("Validation failed: {}", fieldErrors);
        return Map.of(
                "status",      400,
                "error",       "Validation Failed",
                "message",     "One or more fields are invalid",
                "fieldErrors", fieldErrors,
                "timestamp",   LocalDateTime.now().toString()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleNotFound(ResourceNotFoundException ex) {
        log.debug("Resource not found: {}", ex.getMessage());
        return errorBody(404, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleBadRequest(BadRequestException ex) {
        log.debug("Bad request: {}", ex.getMessage());
        return errorBody(400, "Bad Request", ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, Object> handleForbidden(ForbiddenException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return errorBody(403, "Forbidden", ex.getMessage());
    }

    /** Spring Security throws this on wrong password during login. */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, Object> handleBadCredentials(BadCredentialsException ex) {
        return errorBody(401, "Unauthorized", "Bad credentials");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleGeneral(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return errorBody(500, "Internal Server Error", "An unexpected error occurred");
    }

    private Map<String, Object> errorBody(int status, String error, String message) {
        return Map.of(
                "status",    status,
                "error",     error,
                "message",   message != null ? message : "Unexpected error",
                "timestamp", LocalDateTime.now().toString()
        );
    }
}
