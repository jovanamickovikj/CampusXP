package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** All followers of a shop manager. */
    List<Follow> findByFollowingIdOrderByFollowedAtDesc(Long followingId);

    /** All shop managers that a user follows. */
    List<Follow> findByFollowerIdOrderByFollowedAtDesc(Long followerId);

    long countByFollowingId(Long followingId);

    long countByFollowerId(Long followerId);
}
