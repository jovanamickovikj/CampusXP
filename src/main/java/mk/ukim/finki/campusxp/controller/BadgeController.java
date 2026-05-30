package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.BadgeResponse;
import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.dto.response.UserBadgeResponse;
import mk.ukim.finki.campusxp.service.BadgeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class BadgeController {

    private final BadgeService badgeService;
    private final Mapper mapper;

    public BadgeController(BadgeService badgeService, Mapper mapper) {
        this.badgeService = badgeService;
        this.mapper = mapper;
    }

    @GetMapping
    public List<BadgeResponse> getAllBadges(){
        return badgeService.getAllBadges()
                .stream()
                .map(mapper::toBadge)
                .toList();
    }

    @GetMapping("/user/{userId}")
    public List<UserBadgeResponse> getAllBadgesForUser(@PathVariable Long userId){
        return badgeService.getAllBadgesForUser(userId)
                .stream()
                .map(mapper::toUserBadge)
                .toList();
    }

    @PostMapping
    public BadgeResponse createBadge(@RequestBody CreateBadgeRequest request){
        return mapper.toBadge(badgeService.createBadge(
                request.name(),
                request.description(),
                request.iconUrl(),
                request.type()
        ));
    }

    @PostMapping("/award")
    public UserBadgeResponse awardBadge(@RequestBody AwardBadgeRequest request){
        return mapper.toUserBadge(badgeService.awardBadge(
                request.userId(),
                request.badgeId()
        ));
    }

    public record CreateBadgeRequest(
            String name,
            String description,
            String iconUrl,
            Badge.BadgeType type
    ) {}

    public record AwardBadgeRequest(
            Long userId,
            Long badgeId
    ) {}
}

