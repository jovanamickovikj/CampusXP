package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.User;

public record UserSummaryResponse(
        Long id,
        String username,
        String fullName,
        String avatarUrl,
        int currentPoints,
        int totalEarnedPoints,
        User.Role role
) {}
