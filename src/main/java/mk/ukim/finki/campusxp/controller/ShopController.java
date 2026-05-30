package mk.ukim.finki.campusxp.controller;

import mk.ukim.finki.campusxp.dto.Mapper;
import mk.ukim.finki.campusxp.dto.response.PurchaseResponse;
import mk.ukim.finki.campusxp.dto.response.ShopItemResponse;
import mk.ukim.finki.campusxp.service.ShopService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/shop")
@CrossOrigin(origins = "*")
public class ShopController {

    private final ShopService shopService;
    private final Mapper mapper;

    public ShopController(ShopService shopService, Mapper mapper) {
        this.shopService = shopService;
        this.mapper = mapper;
    }

    @GetMapping("/items")
    public List<ShopItemResponse> getItems(){
        return shopService.getActiveShopItems()
                .stream().map(mapper::toShopItem)
                .toList();
    }

    @GetMapping("items/{id}")
    public ShopItemResponse getItem(@PathVariable Long id){
        return mapper.toShopItem(shopService.getItemById(id));
    }

    @PostMapping("/items")
    public ShopItemResponse createItem(@RequestBody CreateShopItemRequest request) {
        return mapper.toShopItem(shopService.createItem(
                request.name(),
                request.description(),
                request.imageUrl(),
                request.pricePoints(),
                request.quantity()
        ));
    }

    @PostMapping("/purchase")
    public PurchaseResponse purchase(@RequestBody PurchaseRequest request) {
        return mapper.toPurchase(shopService.purchaseItem(
                request.userId(),
                request.shopItemId()
        ));
    }

    @GetMapping("/purchases/{userId}")
    public List<PurchaseResponse> getPurchases(@PathVariable Long userId) {
        return shopService.getPurchasesForUser(userId).stream()
                .map(mapper::toPurchase)
                .toList();
    }

    public record CreateShopItemRequest(
            String name,
            String description,
            String imageUrl,
            int pricePoints,
            int quantity
    ) {}

    public record PurchaseRequest(Long userId, Long shopItemId) {}
}
