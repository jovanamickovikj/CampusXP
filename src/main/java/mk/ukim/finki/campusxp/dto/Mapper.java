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
                user.getCurrentPoints(),
                user.getTotalEarnedPoints(),
                user.getRole()
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

    public UserProfileResponse toUserProfile(User user, List<Badge> badges, int postCount, int friendCount){
        List<BadgeResponse> badgeResponses = badges.stream().map(this::toBadge).toList();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getCurrentPoints(),
                user.getTotalEarnedPoints(),
                user.getRole(),
                badgeResponses,
                postCount,
                friendCount
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
                post.getCreatedAt(),
                toUserSummary(post.getUser())
        );
    }

    public FriendshipResponse toFriendship(Friendship friendship, Long currentUserId){
        UserSummaryResponse otherUser = friendship.getRequester().equals(currentUserId)
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

    public ShopItemResponse toShopItem(ShopItem shopItem){
        return new ShopItemResponse(
                shopItem.getId(),
                shopItem.getName(),
                shopItem.getDescription(),
                shopItem.getImageUrl(),
                shopItem.getPricePoints(),
                shopItem.getQuantity(),
                shopItem.isActive()
        );
    }

    public PurchaseResponse toPurchase(Purchase purchase){
        return new PurchaseResponse(
                purchase.getId(),
                toShopItem(purchase.getShopItem()),
                purchase.getPointsPaid(),
                purchase.getPurchasedAt(),
                toUserSummary(purchase.getUser())
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
