package mk.ukim.finki.campusxp.dto.response;

/**
 * Describes the relationship from the viewer's perspective toward a target user.
 *
 * status values:
 *   NONE      — no relationship
 *   SENT      — viewer sent a pending request to target
 *   RECEIVED  — target sent a pending request to viewer
 *   ACCEPTED  — friends
 */
public record FriendshipStatusResponse(
        String status,       // NONE | SENT | RECEIVED | ACCEPTED
        Long friendshipId    // null when status == NONE
) {}
