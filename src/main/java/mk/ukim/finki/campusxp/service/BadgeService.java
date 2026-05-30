package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.model.UserBadge;
import mk.ukim.finki.campusxp.repository.BadgeRepository;
import mk.ukim.finki.campusxp.repository.UserBadgeRepository;
import mk.ukim.finki.campusxp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserService userService;


    public BadgeService(UserBadgeRepository userBadgeRepository, UserRepository userRepository, BadgeRepository badgeRepository, UserService userService) {
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userService = userService;
    }

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Badge createBadge(String name, String description, String iconUrl, Badge.BadgeType type) {
        Badge badge = new Badge();
        badge.setName(name);
        badge.setDescription(description);
        badge.setIconUrl(iconUrl);
        badge.setType(type);
        return badgeRepository.save(badge);
    }

    public UserBadge awardBadge(Long UserId, Long BadgeId) {
        if(userBadgeRepository.existsByUserIdAndBadgeId(UserId, BadgeId)){
            throw new BadRequestException("User already has this badge.");
        }
        User user = userService.findById(UserId);
        Badge badge = badgeRepository.findById(BadgeId);
        UserBadge userBadge = new UserBadge();
        userBadge.setUser(user);
        userBadge.setBadge(badge);
        userBadgeRepository.save(userBadge);
        return userBadge;
    }

    public List<UserBadge> getAllBadgesForUser(Long UserId){
        return userBadgeRepository.findByUserId(UserId);
    }
}

