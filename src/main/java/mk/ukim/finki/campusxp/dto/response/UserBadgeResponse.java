package mk.ukim.finki.campusxp.dto.response;

import java.time.LocalDateTime;

public record UserBadgeResponse(
        Long id,
        BadgeResponse badge,
        LocalDateTime createdAt
) {
}
