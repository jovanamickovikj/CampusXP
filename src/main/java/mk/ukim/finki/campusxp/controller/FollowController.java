package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.UserSummaryResponse;
import mk.ukim.finki.campusxp.service.FollowService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;
    private final Mapper mapper;

    public FollowController(FollowService followService, Mapper mapper) {
        this.followService = followService;
        this.mapper = mapper;
    }

    /** Follow a shop manager. */
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void follow(@RequestBody FollowRequest request) {
        followService.follow(request.followerId(), request.followingId());
    }

    /** Unfollow a shop manager. */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(@RequestParam Long followerId, @RequestParam Long followingId) {
        followService.unfollow(followerId, followingId);
    }

    /** Check whether a user is following a shop manager. */
    @GetMapping("/status")
    public Map<String, Boolean> status(@RequestParam Long followerId, @RequestParam Long followingId) {
        return Map.of("following", followService.isFollowing(followerId, followingId));
    }

    /** All followers of a shop manager. */
    @GetMapping("/followers/{shopManagerId}")
    public List<UserSummaryResponse> getFollowers(@PathVariable Long shopManagerId) {
        return followService.getFollowers(shopManagerId).stream().map(mapper::toUserSummary).toList();
    }

    /** All shop managers a user follows. */
    @GetMapping("/following/{userId}")
    public List<UserSummaryResponse> getFollowing(@PathVariable Long userId) {
        return followService.getFollowing(userId).stream().map(mapper::toUserSummary).toList();
    }

    public record FollowRequest(Long followerId, Long followingId) {}
}
