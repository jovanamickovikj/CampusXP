package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.FriendshipResponse;
import mk.ukim.finki.campusxp.dto.response.FriendshipStatusResponse;
import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.service.FriendshipService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final Mapper mapper;

    public FriendshipController(FriendshipService friendshipService, Mapper mapper) {
        this.friendshipService = friendshipService;
        this.mapper = mapper;
    }

    /** Accepted friends for a user. */
    @GetMapping("/{userId}")
    public List<FriendshipResponse> getFriends(@PathVariable Long userId) {
        return friendshipService.getFriends(userId)
                .stream().map(f -> mapper.toFriendship(f, userId)).toList();
    }

    /** Incoming pending requests (userId is receiver). */
    @GetMapping("/{userId}/pending")
    public List<FriendshipResponse> getPendingRequests(@PathVariable Long userId) {
        return friendshipService.getPendingRequests(userId)
                .stream().map(f -> mapper.toFriendship(f, userId)).toList();
    }

    /** Outgoing pending requests (userId is requester). */
    @GetMapping("/{userId}/sent")
    public List<FriendshipResponse> getSentRequests(@PathVariable Long userId) {
        return friendshipService.getSentPendingRequests(userId)
                .stream().map(f -> mapper.toFriendship(f, userId)).toList();
    }

    /**
     * Returns the full status between two users: NONE | SENT | RECEIVED | ACCEPTED.
     * viewerId = the person looking at the profile, targetId = the profile being viewed.
     */
    @GetMapping("/status")
    public FriendshipStatusResponse getStatus(@RequestParam Long viewerId, @RequestParam Long targetId) {
        Optional<Friendship> opt = friendshipService.findBetween(viewerId, targetId);
        if (opt.isEmpty()) return new FriendshipStatusResponse("NONE", null);

        Friendship f = opt.get();
        String status;
        if (f.getStatus() == Friendship.Status.ACCEPTED) {
            status = "ACCEPTED";
        } else if (f.getRequester().getId().equals(viewerId)) {
            status = "SENT";
        } else {
            status = "RECEIVED";
        }
        return new FriendshipStatusResponse(status, f.getId());
    }

    /** IDs of all connected users (any status) — used to build status map on frontend. */
    @GetMapping("/{userId}/connected-ids")
    public List<Long> getConnectedUserIds(@PathVariable Long userId) {
        return friendshipService.getAllInvolvingUser(userId).stream()
                .map(f -> f.getRequester().getId().equals(userId)
                        ? f.getReceiver().getId()
                        : f.getRequester().getId())
                .distinct().toList();
    }

    @PostMapping("/request")
    @ResponseStatus(HttpStatus.CREATED)
    public FriendshipResponse sendRequest(@RequestBody FriendRequest request) {
        return mapper.toFriendship(
                friendshipService.sendRequest(request.requesterId(), request.receiverId()),
                request.requesterId()
        );
    }

    @PostMapping("/accept/{friendshipId}")
    public FriendshipResponse acceptFriendship(@PathVariable Long friendshipId) {
        Long requesterId = friendshipService.getFriendship(friendshipId).getRequester().getId();
        Friendship accepted = friendshipService.acceptRequest(friendshipId);
        return mapper.toFriendship(accepted, requesterId);
    }

    /** Cancel pending request, decline incoming request, or remove an accepted friendship. */
    @DeleteMapping("/{friendshipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFriendship(@PathVariable Long friendshipId) {
        friendshipService.removeFriendship(friendshipId);
    }

    public record FriendRequest(Long requesterId, Long receiverId) {}
}
