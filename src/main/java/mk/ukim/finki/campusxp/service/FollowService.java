package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.model.Follow;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.FollowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;

    public FollowService(FollowRepository followRepository, UserService userService) {
        this.followRepository = followRepository;
        this.userService = userService;
    }

    /**
     * Regular user follows a verified shop manager.
     * Validates that the follower is a regular USER and the target is a SHOP_MANAGER.
     */
    @Transactional
    public Follow follow(Long followerId, Long shopManagerId) {
        if (followerId.equals(shopManagerId))
            throw new BadRequestException("You cannot follow yourself");

        User follower    = userService.findById(followerId);
        User shopManager = userService.findById(shopManagerId);

        if (follower.getAccountType() != User.AccountType.USER)
            throw new BadRequestException("Only regular users can follow shop managers");
        if (shopManager.getAccountType() != User.AccountType.SHOP_MANAGER)
            throw new BadRequestException("You can only follow verified shop managers");
        if (shopManager.getVerificationStatus() != User.VerificationStatus.VERIFIED)
            throw new BadRequestException("This shop manager is not yet verified");

        if (followRepository.existsByFollowerIdAndFollowingId(followerId, shopManagerId))
            throw new BadRequestException("You are already following this shop manager");

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(shopManager);
        return followRepository.save(follow);
    }

    @Transactional
    public void unfollow(Long followerId, Long shopManagerId) {
        if (!followRepository.existsByFollowerIdAndFollowingId(followerId, shopManagerId))
            throw new BadRequestException("You are not following this user");
        followRepository.deleteByFollowerIdAndFollowingId(followerId, shopManagerId);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long shopManagerId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, shopManagerId);
    }

    /** Returns all users who follow the given shop manager. */
    @Transactional(readOnly = true)
    public List<User> getFollowers(Long shopManagerId) {
        return followRepository.findByFollowingIdOrderByFollowedAtDesc(shopManagerId)
                .stream().map(Follow::getFollower).toList();
    }

    /** Returns all shop managers a given user follows. */
    @Transactional(readOnly = true)
    public List<User> getFollowing(Long userId) {
        return followRepository.findByFollowerIdOrderByFollowedAtDesc(userId)
                .stream().map(Follow::getFollowing).toList();
    }

    @Transactional(readOnly = true)
    public long getFollowersCount(Long shopManagerId) {
        return followRepository.countByFollowingId(shopManagerId);
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }
}
