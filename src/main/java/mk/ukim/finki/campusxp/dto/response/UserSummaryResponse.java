package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.User;

public record UserSummaryResponse(
        Long id,
        String username,
        String fullName,
        String avatarUrl,
        String bio,
        int currentPoints,
        int totalEarnedPoints,
        User.Role role,
        User.AccountType accountType,
        User.VerificationStatus verificationStatus
) {}
