package mk.ukim.finki.campusxp.dto.response;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        String fullName,
        String avatarUrl,
        String role,
        String accountType,
        String verificationStatus
) {}
