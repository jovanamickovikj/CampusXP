package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(long userId);
}
