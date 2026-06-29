package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    boolean existsByName(String name);
}
