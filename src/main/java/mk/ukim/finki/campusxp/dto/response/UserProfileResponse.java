package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.User;

import java.util.List;

public record UserProfileResponse(
        Long id,
        String username,
        String fullName,
        String avatarUrl,
        String bio,
        int currentPoints,
        int totalEarnedPoints,
        User.Role role,
        User.AccountType accountType,
        User.VerificationStatus verificationStatus,
        List<BadgeResponse> badges,
        int postCount,
        /** Friends count — only meaningful for regular users (0 for shop managers). */
        int friendCount,
        /** Shop managers this user follows — only meaningful for regular users (0 for shop managers). */
        int followingCount,
        /** Users who follow this shop manager — only meaningful for shop managers (0 for regular users). */
        int followersCount
) {}
