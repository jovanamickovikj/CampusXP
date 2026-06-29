package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.Post;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String title,
        String description,
        String fileUrl,
        Post.PostType postType,
        int pointsAwarded,
        boolean archived,
        LocalDateTime createdAt,
        UserSummaryResponse author
) {}
