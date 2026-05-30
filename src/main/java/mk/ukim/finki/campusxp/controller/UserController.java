package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.UserProfileResponse;
import mk.ukim.finki.campusxp.dto.response.UserSummaryResponse;
import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.model.UserBadge;
import mk.ukim.finki.campusxp.repository.FriendshipRepository;
import mk.ukim.finki.campusxp.service.BadgeService;
import mk.ukim.finki.campusxp.service.FriendshipService;
import mk.ukim.finki.campusxp.service.PostService;
import mk.ukim.finki.campusxp.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final BadgeService  badgeService;
    private final PostService postService;
    private final FriendshipService friendshipService;
    private final Mapper mapper;

    public UserController(UserService userService, BadgeService badgeService, PostService postService, FriendshipService friendshipService, Mapper mapper) {
        this.userService = userService;
        this.badgeService = badgeService;
        this.postService = postService;
        this.friendshipService = friendshipService;
        this.mapper = mapper;
    }

    @GetMapping
    public List<UserSummaryResponse> getUsers() {
        return userService.getAllUsers()
                .stream()
                .map(mapper::toUserSummary)
                .toList();
    }

    @GetMapping("/{id}")
    public UserSummaryResponse getUser(@PathVariable long id) {
        return mapper.toUserSummary(userService.findById(id));
    }

    @PostMapping("/{id}/profile")
    public UserProfileResponse getProfile(@PathVariable Long id){
        User user = userService.findById(id);
        List<Badge> badges = badgeService.getAllBadgesForUser(user.getId()).stream()
                .map(UserBadge::getBadge).toList();
        int postCount = postService.getPostsForUser(user.getId()).size();
        int friendCount = friendshipService.getFriends(id).size();

        return mapper.toUserProfile(user, badges, postCount, friendCount);
    }

    @PostMapping
    public UserSummaryResponse createUser(@RequestBody CreateUserRequest request) {
        return mapper.toUserSummary(userService.createUser(
                request.username(),
                request.email(),
                request.fullName(),
                request.role()
        ));
    }

    public record CreateUserRequest(
            String username,
            String email,
            String fullName,
            User.Role role
    ) {}
}
