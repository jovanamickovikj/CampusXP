package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Badge;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.model.UserBadge;
import mk.ukim.finki.campusxp.repository.BadgeRepository;
import mk.ukim.finki.campusxp.repository.UserBadgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @Transactional
    public Badge createBadge(String name, String description, String iconUrl, Badge.BadgeType type) {
        Badge badge = new Badge();
        badge.setName(name);
        badge.setDescription(description);
        badge.setIconUrl(iconUrl);
        badge.setType(type);
        Badge saved = badgeRepository.save(badge);
        log.info("Badge created: id={}, name='{}'", saved.getId(), name);
        return saved;
    }

    @Transactional(readOnly = true)
    public Badge findBadgeById(Long id) {
        return badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + id));
    }

    @Transactional
    public UserBadge awardBadge(Long userId, Long badgeId) {
        if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId))
            throw new BadRequestException("User already has this badge");

        User user   = userService.findById(userId);
        Badge badge = findBadgeById(badgeId);

        UserBadge userBadge = new UserBadge();
        userBadge.setUser(user);
        userBadge.setBadge(badge);
        UserBadge saved = userBadgeRepository.save(userBadge);
        log.info("Badge awarded: userId={}, badgeId={}", userId, badgeId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<UserBadge> getAllBadgesForUser(Long userId) {
        return userBadgeRepository.findByUserId(userId);
    }
}
