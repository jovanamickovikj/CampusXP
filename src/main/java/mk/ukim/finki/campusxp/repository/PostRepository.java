package mk.ukim.finki.campusxp.repository;

import mk.ukim.finki.campusxp.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post,Long> {
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds);
}
