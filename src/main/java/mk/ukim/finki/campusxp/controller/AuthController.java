package mk.ukim.finki.campusxp.controller;

import jakarta.validation.Valid;
import mk.ukim.finki.campusxp.dto.request.LoginRequest;
import mk.ukim.finki.campusxp.dto.request.RegisterRequest;
import mk.ukim.finki.campusxp.dto.response.AuthResponse;
import mk.ukim.finki.campusxp.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoints — no JWT required.
 * POST /api/auth/register  → creates account, returns token
 * POST /api/auth/login     → validates credentials, returns token
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
