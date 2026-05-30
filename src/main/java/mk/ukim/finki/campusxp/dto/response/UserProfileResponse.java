package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.User;

import java.util.List;

public record UserProfileResponse(
        Long id,
        String username,
        String fullName,
        String avatarUrl,
        int currentPoints,
        int totalEarnedPoints,
        User.Role role,
        List<BadgeResponse> badges,
        int postCount,
        int friendCount
) {}
