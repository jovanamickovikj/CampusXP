package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findAllByOrderByTotalEarnedPointsDesc();

    /** All shop manager applications waiting for admin review. */
    List<User> findByAccountTypeAndVerificationStatusOrderByIdAsc(
            User.AccountType accountType, User.VerificationStatus verificationStatus);
}
