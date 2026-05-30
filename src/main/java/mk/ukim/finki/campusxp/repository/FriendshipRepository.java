package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship,Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAcceptedFriendships(Long userId);

    @Query("SELECT f FROM Friendship f WHERE f.requester.id = :requesterId AND f.receiver.id = :receiverId")
    Optional<Friendship> findByRequesterAndReceiver(Long  requesterId, Long receiverId);
}
