package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Purchase;
import mk.ukim.finki.campusxp.model.ShopItem;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.PurchaseRepository;
import mk.ukim.finki.campusxp.repository.ShopItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopItemRepository shopItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserService userService;

    // ── Public browsing ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ShopItem> getActiveShopItems() {
        return shopItemRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<ShopItem> getAllItems() {
        return shopItemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ShopItem> getMyItems(Long userId) {
        return shopItemRepository.findByCreatedByIdOrderByIdDesc(userId);
    }

    @Transactional(readOnly = true)
    public ShopItem getItemById(Long id) {
        return shopItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop item not found"));
    }

    // ── Shop management — verified shop managers or admin ─────────────────────

    @Transactional
    public ShopItem createItem(Long requestingUserId, String name, String description,
                               String imageUrl, int pricePoints, int quantity) {
        User creator = userService.findById(requestingUserId);
        requireShopAccess(creator);

        ShopItem item = new ShopItem();
        item.setName(name);
        item.setDescription(description);
        item.setImageUrl(imageUrl);
        item.setPricePoints(pricePoints);
        item.setQuantity(quantity);
        item.setInitialQuantity(quantity);
        item.setPurchaseCount(0);
        item.setActive(quantity > 0);
        item.setCreatedBy(creator);

        ShopItem saved = shopItemRepository.save(item);
        log.info("Shop item created: id={}, name='{}', createdBy={}", saved.getId(), name, requestingUserId);
        return saved;
    }

    @Transactional
    public ShopItem updateItem(Long id, Long requestingUserId, String name, String description,
                               String imageUrl, Integer pricePoints, Integer quantity) {
        User requester = userService.findById(requestingUserId);
        requireShopAccess(requester);

        ShopItem item = getItemById(id);
        requireOwnership(item, requester);

        if (name        != null && !name.isBlank())      item.setName(name);
        if (description != null)                          item.setDescription(description);
        if (imageUrl    != null)                          item.setImageUrl(imageUrl);
        if (pricePoints != null && pricePoints > 0)      item.setPricePoints(pricePoints);
        if (quantity    != null && quantity >= 0) {
            item.setQuantity(quantity);
            item.setActive(quantity > 0);
        }

        log.debug("Shop item updated: id={}", id);
        return shopItemRepository.save(item);
    }

    /** Soft delete — marks item inactive rather than removing it. */
    @Transactional
    public void deactivateItem(Long id, Long requestingUserId) {
        User requester = userService.findById(requestingUserId);
        requireShopAccess(requester);

        ShopItem item = getItemById(id);
        requireOwnership(item, requester);

        item.setActive(false);
        shopItemRepository.save(item);
        log.info("Shop item deactivated: id={}", id);
    }

    // ── Purchase — regular users only ─────────────────────────────────────────

    @Transactional
    public Purchase purchaseItem(Long userId, Long shopItemId) {
        User user = userService.findById(userId);

        if (user.getAccountType() == User.AccountType.SHOP_MANAGER)
            throw new BadRequestException("Shop managers cannot purchase items");
        if (user.isAdmin())
            throw new BadRequestException("Admin accounts cannot purchase items");

        ShopItem item = getItemById(shopItemId);
        if (!item.isActive())            throw new BadRequestException("This item is no longer available");
        if (item.getQuantity() == 0)     throw new BadRequestException("This item is sold out");
        if (user.getCurrentPoints() < item.getPricePoints())
            throw new BadRequestException("Not enough points to purchase this item");

        item.setQuantity(item.getQuantity() - 1);
        item.setPurchaseCount(item.getPurchaseCount() + 1);
        if (item.getQuantity() == 0) item.setActive(false);
        shopItemRepository.save(item);

        userService.spendPoints(userId, item.getPricePoints(), "Purchase: " + item.getName());

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setShopItem(item);
        purchase.setPointsPaid(item.getPricePoints());
        Purchase saved = purchaseRepository.save(purchase);

        log.info("Purchase completed: userId={}, itemId={}, pointsPaid={}", userId, shopItemId, item.getPricePoints());
        return saved;
    }

    // ── Inventory / purchase history ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Purchase> getPurchasesForUser(Long userId) {
        return purchaseRepository.findByUserIdOrderByPurchasedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Purchase> getInventoryForUser(Long userId) {
        return purchaseRepository.findByUserIdAndUsedFalseOrderByPurchasedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Purchase> getUsedItemsForUser(Long userId) {
        return purchaseRepository.findByUserIdAndUsedTrueOrderByUsedAtDesc(userId);
    }

    @Transactional
    public Purchase useItem(Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found"));
        if (purchase.isUsed())
            throw new BadRequestException("This item has already been used");
        purchase.setUsed(true);
        purchase.setUsedAt(LocalDateTime.now());
        log.debug("Purchase used: id={}", purchaseId);
        return purchaseRepository.save(purchase);
    }

    // ── Internal guards ───────────────────────────────────────────────────────

    /** Only ADMIN or VERIFIED SHOP_MANAGERs can manage shop items. */
    private void requireShopAccess(User user) {
        if (user.isAdmin()) return;
        if (user.isVerifiedShopManager()) return;
        throw new BadRequestException("Only verified shop managers or admins can manage shop items");
    }

    /**
     * Admins can modify any item.
     * Shop managers can only modify items they created.
     * Items with no creator (legacy seed data) are admin-only.
     */
    private void requireOwnership(ShopItem item, User requester) {
        if (requester.isAdmin()) return;
        if (item.getCreatedBy() == null)
            throw new BadRequestException("This item can only be managed by an admin");
        if (!item.getCreatedBy().getId().equals(requester.getId()))
            throw new BadRequestException("You can only manage your own shop items");
    }
}
