package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Purchase;
import org.springframework.boot.autoconfigure.jackson.JacksonProperties;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByUserIdOrderByPurchasedAtDesc(Long userId);
}
