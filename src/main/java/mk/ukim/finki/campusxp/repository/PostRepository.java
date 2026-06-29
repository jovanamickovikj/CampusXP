package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserIdAndArchivedFalseOrderByCreatedAtDesc(Long userId);

    List<Post> findByUserIdInAndArchivedFalseOrderByCreatedAtDesc(List<Long> userIds);

    List<Post> findByUserIdAndArchivedTrueOrderByCreatedAtDesc(Long userId);

    /** Efficient count — avoids loading Post entities into memory. */
    long countByUserIdAndArchivedFalse(Long userId);
}
