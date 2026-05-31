package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Purchase;
import mk.ukim.finki.campusxp.model.ShopItem;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.PurchaseRepository;
import mk.ukim.finki.campusxp.repository.ShopItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserService userService;

    public ShopService(ShopItemRepository shopItemRepository, PurchaseRepository purchaseRepository, UserService userService) {
        this.shopItemRepository = shopItemRepository;
        this.purchaseRepository = purchaseRepository;
        this.userService = userService;
    }

    public List<ShopItem> getActiveShopItems() {
        return shopItemRepository.findByActiveTrue();
    }

    public ShopItem getItemById(Long id){
        return shopItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop item not found"));
    }

    public ShopItem createItem(String name, String description, String imageUrl, int pricePoints, int quantity){
        ShopItem shopItem = new ShopItem();
        shopItem.setName(name);
        shopItem.setDescription(description);
        shopItem.setImageUrl(imageUrl);
        shopItem.setPricePoints(pricePoints);
        shopItem.setQuantity(quantity);
        return  shopItemRepository.save(shopItem);
    }

    public Purchase purchaseItem(Long userId, Long shopItemId){
        User user = userService.findById(userId);
        ShopItem shopItem = getItemById(shopItemId);

        if(!shopItem.isActive())
            throw  new BadRequestException("The item is no longer available");
        if(shopItem.getQuantity() == 0)
            throw  new BadRequestException("The item is sold out");
        if(user.getCurrentPoints() <  shopItem.getPricePoints())
            throw  new BadRequestException("Not enough points to purchase this item");

        shopItem.setQuantity(shopItem.getQuantity() - 1);
        if(shopItem.getQuantity() == 0)
            shopItem.setActive(false);
        shopItemRepository.save(shopItem);

        userService.spendPoints(userId, shopItem.getPricePoints(), "Purchase: " + shopItem.getName());

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setShopItem(shopItem);
        purchase.setPointsPaid(shopItem.getPricePoints());

        purchaseRepository.save(purchase);
        return purchase;
    }

    public List<Purchase> getPurchasesForUser(Long userId){
        return purchaseRepository.findByUserIdOrderByPurchasedAtDesc(userId);
    }

}
