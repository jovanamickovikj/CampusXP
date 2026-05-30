package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.Badge;

public record BadgeResponse(
        Long id,
        String name,
        String description,
        String iconUrl,
        Badge.BadgeType type
) {}
