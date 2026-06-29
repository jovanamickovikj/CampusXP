package mk.ukim.finki.campusxp.dto.response;

public record ShopItemResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        int pricePoints,
        int quantity,
        int initialQuantity,
        int purchaseCount,
        boolean active,
        Long createdById,
        String createdByUsername
) {}
