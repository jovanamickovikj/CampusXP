package mk.ukim.finki.campusxp.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.PurchaseResponse;
import mk.ukim.finki.campusxp.dto.response.ShopItemResponse;
import mk.ukim.finki.campusxp.service.ShopService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final ShopService shopService;
    private final Mapper mapper;

    public ShopController(ShopService shopService, Mapper mapper) {
        this.shopService = shopService;
        this.mapper = mapper;
    }

    // ── Public browsing ───────────────────────────────────────────────────────

    @GetMapping("/items")
    public List<ShopItemResponse> getItems() {
        return shopService.getActiveShopItems().stream().map(mapper::toShopItem).toList();
    }

    /** Admin only — all items regardless of active status. */
    @GetMapping("/items/all")
    public List<ShopItemResponse> getAllItems() {
        return shopService.getAllItems().stream().map(mapper::toShopItem).toList();
    }

    /** Items created by the requesting user (verified shop manager's own products). */
    @GetMapping("/items/mine")
    public List<ShopItemResponse> getMyItems(@RequestParam Long userId) {
        return shopService.getMyItems(userId).stream().map(mapper::toShopItem).toList();
    }

    @GetMapping("/items/{id}")
    public ShopItemResponse getItem(@PathVariable Long id) {
        return mapper.toShopItem(shopService.getItemById(id));
    }

    // ── Shop management ───────────────────────────────────────────────────────

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ShopItemResponse createItem(@Valid @RequestBody CreateShopItemRequest request) {
        return mapper.toShopItem(shopService.createItem(
                request.requestingUserId(),
                request.name(), request.description(), request.imageUrl(),
                request.pricePoints(), request.quantity()));
    }

    @PutMapping("/items/{id}")
    public ShopItemResponse updateItem(@PathVariable Long id, @Valid @RequestBody UpdateShopItemRequest request) {
        return mapper.toShopItem(shopService.updateItem(
                id, request.requestingUserId(),
                request.name(), request.description(), request.imageUrl(),
                request.pricePoints(), request.quantity()));
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id, @RequestParam Long requestingUserId) {
        shopService.deactivateItem(id, requestingUserId);
    }

    // ── Purchase ──────────────────────────────────────────────────────────────

    @PostMapping("/purchase")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponse purchase(@Valid @RequestBody PurchaseRequest request) {
        return mapper.toPurchase(shopService.purchaseItem(request.userId(), request.shopItemId()));
    }

    @GetMapping("/purchases/{userId}")
    public List<PurchaseResponse> getPurchases(@PathVariable Long userId) {
        return shopService.getPurchasesForUser(userId).stream().map(mapper::toPurchase).toList();
    }

    @GetMapping("/inventory/{userId}")
    public List<PurchaseResponse> getInventory(@PathVariable Long userId) {
        return shopService.getInventoryForUser(userId).stream().map(mapper::toPurchase).toList();
    }

    @GetMapping("/purchases/history/{userId}")
    public List<PurchaseResponse> getUsedHistory(@PathVariable Long userId) {
        return shopService.getUsedItemsForUser(userId).stream().map(mapper::toPurchase).toList();
    }

    @PutMapping("/purchases/{purchaseId}/use")
    public PurchaseResponse useItem(@PathVariable Long purchaseId) {
        return mapper.toPurchase(shopService.useItem(purchaseId));
    }

    // ── Request records ───────────────────────────────────────────────────────

    public record CreateShopItemRequest(
            @NotNull(message = "requestingUserId is required") Long requestingUserId,
            @NotBlank(message = "Name is required") @Size(max = 100, message = "Name must not exceed 100 characters") String name,
            @Size(max = 500, message = "Description must not exceed 500 characters") String description,
            String imageUrl,
            @Min(value = 1, message = "Price must be at least 1 point") int pricePoints,
            @Min(value = 0, message = "Quantity cannot be negative") int quantity
    ) {}

    public record UpdateShopItemRequest(
            @NotNull(message = "requestingUserId is required") Long requestingUserId,
            @Size(max = 100, message = "Name must not exceed 100 characters") String name,
            @Size(max = 500, message = "Description must not exceed 500 characters") String description,
            String imageUrl,
            @Min(value = 1, message = "Price must be at least 1 point") Integer pricePoints,
            @Min(value = 0, message = "Quantity cannot be negative") Integer quantity
    ) {}

    public record PurchaseRequest(
            @NotNull(message = "userId is required") Long userId,
            @NotNull(message = "shopItemId is required") Long shopItemId
    ) {}
}
