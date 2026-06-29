package mk.ukim.finki.campusxp.dto.response;

import java.time.LocalDateTime;

public record PurchaseResponse(
        Long id,
        ShopItemResponse shopItem,
        int pointsPaid,
        LocalDateTime purchasedAt,
        UserSummaryResponse user,
        boolean used,
        LocalDateTime usedAt
) {}
