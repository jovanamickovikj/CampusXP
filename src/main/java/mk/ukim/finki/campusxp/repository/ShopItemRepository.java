package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {
    List<ShopItem> findByActiveTrue();
    /** Items created by a specific shop manager (or admin). */
    List<ShopItem> findByCreatedByIdOrderByIdDesc(Long createdById);
}
