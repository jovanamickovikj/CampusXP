package mk.ukim.finki.campusxp.dto;

import mk.ukim.finki.campusxp.dto.response.*;
import mk.ukim.finki.campusxp.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class Mapper {

    public UserSummaryResponse toUserSummary(User user){
        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getCurrentPoints(),
                user.getTotalEarnedPoints(),
                user.getRole(),
                user.getAccountType(),
                user.getVerificationStatus()
        );
    }

    public BadgeResponse toBadge(Badge badge){
        return new BadgeResponse(
                badge.getId(),
                badge.getName(),
                badge.getDescription(),
                badge.getIconUrl(),
                badge.getType()
        );
    }

    public UserProfileResponse toUserProfile(User user, List<Badge> badges,
                                             int postCount, int friendCount,
                                             int followingCount, int followersCount) {
        List<BadgeResponse> badgeResponses = badges.stream().map(this::toBadge).toList();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getCurrentPoints(),
                user.getTotalEarnedPoints(),
                user.getRole(),
                user.getAccountType(),
                user.getVerificationStatus(),
                badgeResponses,
                postCount,
                friendCount,
                followingCount,
                followersCount
        );
    }

    public PostResponse toPost(Post post){
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getDescription(),
                post.getFileUrl(),
                post.getPostType(),
                post.getPointsAwarded(),
                post.isArchived(),
                post.getCreatedAt(),
                toUserSummary(post.getUser())
        );
    }

    public FriendshipResponse toFriendship(Friendship friendship, Long currentUserId){
        UserSummaryResponse otherUser = friendship.getRequester().getId().equals(currentUserId)
                ? toUserSummary(friendship.getReceiver())
                : toUserSummary(friendship.getRequester());

        return new FriendshipResponse(
                friendship.getId(),
                friendship.getStatus(),
                friendship.getCreatedAt(),
                otherUser
        );
    }

    public UserBadgeResponse toUserBadge(UserBadge userBadge){
        return new UserBadgeResponse(
                userBadge.getId(),
                toBadge(userBadge.getBadge()),
                userBadge.getEarnedAt()
        );
    }

    public ShopItemResponse toShopItem(ShopItem item){
        return new ShopItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getImageUrl(),
                item.getPricePoints(),
                item.getQuantity(),
                item.getInitialQuantity(),
                item.getPurchaseCount(),
                item.isActive(),
                item.getCreatedBy() != null ? item.getCreatedBy().getId() : null,
                item.getCreatedBy() != null ? item.getCreatedBy().getUsername() : null
        );
    }

    public PurchaseResponse toPurchase(Purchase purchase){
        return new PurchaseResponse(
                purchase.getId(),
                toShopItem(purchase.getShopItem()),
                purchase.getPointsPaid(),
                purchase.getPurchasedAt(),
                toUserSummary(purchase.getUser()),
                purchase.isUsed(),
                purchase.getUsedAt()
        );
    }

    public PointTransactionResponse toPointTransaction(PointTransaction tx) {
        return new PointTransactionResponse(
                tx.getId(),
                tx.getAmount(),
                tx.getType(),
                tx.getReason(),
                tx.getCreatedAt()
        );
    }
}
