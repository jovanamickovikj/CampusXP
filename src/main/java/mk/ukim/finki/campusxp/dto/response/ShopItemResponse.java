package mk.ukim.finki.campusxp.dto.response;

public record ShopItemResponse(
        Long id,
        String name,
        String description,
        String imageUrl,
        int pricePoints,
        int quantity,
        boolean active
) {
}
