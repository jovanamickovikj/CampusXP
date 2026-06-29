package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship,Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(@Param("userId") Long userId);

    /** Check both directions so duplicate requests in either direction are caught. */
    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :a AND f.receiver.id = :b) OR (f.requester.id = :b AND f.receiver.id = :a)")
    Optional<Friendship> findBetweenUsers(@Param("a") Long a, @Param("b") Long b);

    /** Incoming pending requests for a user (they are the receiver). */
    @Query("SELECT f FROM Friendship f WHERE f.receiver.id = :userId AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsForUser(@Param("userId") Long userId);

    /** All friendships (any status) involving a user — used to exclude from "find people". */
    @Query("SELECT f FROM Friendship f WHERE f.requester.id = :userId OR f.receiver.id = :userId")
    List<Friendship> findAllInvolvingUser(@Param("userId") Long userId);

    /** Pending requests sent BY a user (they are the requester). */
    @Query("SELECT f FROM Friendship f WHERE f.requester.id = :userId AND f.status = 'PENDING'")
    List<Friendship> findSentPendingByUser(@Param("userId") Long userId);
}
