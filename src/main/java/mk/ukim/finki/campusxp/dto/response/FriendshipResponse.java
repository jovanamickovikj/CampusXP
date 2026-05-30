package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.Friendship;

import java.time.LocalDateTime;

public record FriendshipResponse(
        Long id,
        Friendship.Status status,
        LocalDateTime createdAt,
        UserSummaryResponse otherUser
) {}
