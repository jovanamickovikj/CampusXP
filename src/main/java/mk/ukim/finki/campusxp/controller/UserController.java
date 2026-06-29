package mk.ukim.finki.campusxp.controller;

import jakarta.validation.Valid;
import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.PointTransactionResponse;
import mk.ukim.finki.campusxp.dto.response.UserProfileResponse;
import mk.ukim.finki.campusxp.dto.response.UserSummaryResponse;
import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.model.UserBadge;
import mk.ukim.finki.campusxp.service.BadgeService;
import mk.ukim.finki.campusxp.service.FollowService;
import mk.ukim.finki.campusxp.service.FriendshipService;
import mk.ukim.finki.campusxp.service.PostService;
import mk.ukim.finki.campusxp.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BadgeService badgeService;
    private final PostService postService;
    private final FriendshipService friendshipService;
    private final FollowService followService;
    private final Mapper mapper;

    public UserController(UserService userService, BadgeService badgeService,
                          PostService postService, FriendshipService friendshipService,
                          FollowService followService, Mapper mapper) {
        this.userService       = userService;
        this.badgeService      = badgeService;
        this.postService       = postService;
        this.friendshipService = friendshipService;
        this.followService     = followService;
        this.mapper            = mapper;
    }

    @GetMapping
    public List<UserSummaryResponse> getUsers() {
        return userService.getAllUsers().stream().map(mapper::toUserSummary).toList();
    }

    @GetMapping("/{id}")
    public UserSummaryResponse getUser(@PathVariable Long id) {
        return mapper.toUserSummary(userService.findById(id));
    }

    @GetMapping("/{id}/profile")
    public UserProfileResponse getProfile(@PathVariable Long id) {
        User user = userService.findById(id);
        List<Badge> badges = badgeService.getAllBadgesForUser(id).stream()
                .map(UserBadge::getBadge).toList();

        // Use count queries — avoids loading all entities just to call .size()
        int postCount      = (int) postService.countPostsForUser(id);
        int friendCount    = 0;
        int followingCount = 0;
        int followersCount = 0;

        if (user.getAccountType() == User.AccountType.USER) {
            friendCount    = friendshipService.getFriends(id).size();
            followingCount = (int) followService.getFollowingCount(id);
        } else if (user.getAccountType() == User.AccountType.SHOP_MANAGER) {
            followersCount = (int) followService.getFollowersCount(id);
        }

        return mapper.toUserProfile(user, badges, postCount, friendCount, followingCount, followersCount);
    }

    @PutMapping("/{id}")
    public UserSummaryResponse updateUser(@PathVariable Long id,
                                          @Valid @RequestBody UpdateUserRequest request) {
        return mapper.toUserSummary(
                userService.updateUser(id,
                        request.username(), request.fullName(), request.email(),
                        request.avatarUrl(), request.bio()));
    }

    @GetMapping("/{id}/points/history")
    public List<PointTransactionResponse> getPointHistory(@PathVariable Long id) {
        return userService.getPointHistory(id).stream().map(mapper::toPointTransaction).toList();
    }

    // ── Admin: shop manager approvals ─────────────────────────────────────────

    @GetMapping("/pending-managers")
    public List<UserSummaryResponse> getPendingManagers() {
        return userService.getPendingShopManagers().stream().map(mapper::toUserSummary).toList();
    }

    @PutMapping("/{id}/verify")
    public UserSummaryResponse verifyShopManager(@PathVariable Long id,
                                                  @RequestBody VerifyRequest request) {
        return mapper.toUserSummary(userService.verifyShopManager(id, request.status()));
    }

    // ── Admin: user management ────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // ── Request records ───────────────────────────────────────────────────────

    public record UpdateUserRequest(
            String username,
            String fullName,
            String email,
            String avatarUrl,
            String bio
    ) {}

    public record VerifyRequest(User.VerificationStatus status) {}
}
