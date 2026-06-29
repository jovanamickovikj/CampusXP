package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.dto.request.LoginRequest;
import mk.ukim.finki.campusxp.dto.request.RegisterRequest;
import mk.ukim.finki.campusxp.dto.response.AuthResponse;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles registration and login.
 * All self-registered accounts get ROLE_USER in Spring Security.
 * Shop manager applicants additionally get accountType=SHOP_MANAGER + verificationStatus=PENDING.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User.AccountType accountType = "SHOP_MANAGER".equalsIgnoreCase(request.accountType())
                ? User.AccountType.SHOP_MANAGER
                : User.AccountType.USER;

        User user = userService.createUserWithPassword(
                request.username(),
                request.email(),
                request.fullName(),
                passwordEncoder.encode(request.password()),
                User.Role.USER,
                accountType
        );

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        log.info("User registered successfully: username={}", user.getUsername());
        return buildAuthResponse(token, user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        User user = userService.findByUsername(request.username());
        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        log.debug("User logged in: username={}", user.getUsername());
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        String verificationStatus = user.getVerificationStatus() != null
                ? user.getVerificationStatus().name() : null;
        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getAccountType().name(),
                verificationStatus
        );
    }
}
