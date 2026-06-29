package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.model.Post;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final FriendshipService friendshipService;

    @Transactional
    public Post createPost(Long userId, String title, String description,
                           String fileUrl, Post.PostType postType) {
        User user = userService.findById(userId);

        // Admins and shop managers (any status) do not earn XP from posts
        int points = user.isPrivileged() ? 0 : calculatePoints(postType, title);

        Post post = new Post();
        post.setUser(user);
        post.setTitle(title);
        post.setDescription(description);
        post.setFileUrl(fileUrl);
        post.setPostType(postType);
        post.setPointsAwarded(points);
        post.setArchived(false);

        Post saved = postRepository.save(post);

        if (points > 0) {
            userService.addPoints(userId, points, "Post: " + title);
        }

        log.info("Post created: id={}, userId={}, type={}, points={}", saved.getId(), userId, postType, points);
        return saved;
    }

    /** Returns only non-archived posts for a user's public profile. */
    @Transactional(readOnly = true)
    public List<Post> getPostsForUser(Long userId) {
        return postRepository.findByUserIdAndArchivedFalseOrderByCreatedAtDesc(userId);
    }

    /** Returns only archived posts — only exposed to the owner. */
    @Transactional(readOnly = true)
    public List<Post> getArchivedPostsForUser(Long userId) {
        return postRepository.findByUserIdAndArchivedTrueOrderByCreatedAtDesc(userId);
    }

    /** Efficient post count — does not load post entities. */
    @Transactional(readOnly = true)
    public long countPostsForUser(Long userId) {
        return postRepository.countByUserIdAndArchivedFalse(userId);
    }

    @Transactional(readOnly = true)
    public Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    @Transactional
    public Post updatePost(Long postId, Long requestingUserId, String title,
                           String description, String fileUrl) {
        Post post = getPostById(postId);
        if (!post.getUser().getId().equals(requestingUserId))
            throw new BadRequestException("You can only edit your own posts");

        if (title != null && !title.isBlank()) post.setTitle(title);
        if (description != null) post.setDescription(description);
        if (fileUrl != null) post.setFileUrl(fileUrl.isBlank() ? null : fileUrl);

        log.debug("Post updated: id={}", postId);
        return postRepository.save(post);
    }

    @Transactional
    public Post archivePost(Long postId, Long requestingUserId) {
        Post post = getPostById(postId);
        if (!post.getUser().getId().equals(requestingUserId))
            throw new BadRequestException("You can only archive your own posts");
        post.setArchived(true);
        log.debug("Post archived: id={}", postId);
        return postRepository.save(post);
    }

    @Transactional
    public Post unarchivePost(Long postId, Long requestingUserId) {
        Post post = getPostById(postId);
        if (!post.getUser().getId().equals(requestingUserId))
            throw new BadRequestException("You can only unarchive your own posts");
        post.setArchived(false);
        log.debug("Post unarchived: id={}", postId);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId, Long requestingUserId) {
        Post post = getPostById(postId);
        if (!post.getUser().getId().equals(requestingUserId))
            throw new BadRequestException("You can only delete your own posts");
        log.info("Post deleted: id={}", postId);
        postRepository.delete(post);
    }

    /** Friends feed — non-archived posts from accepted friends, newest first. */
    @Transactional(readOnly = true)
    public List<Post> getFriendsFeed(Long userId) {
        List<Friendship> friendships = friendshipService.getFriends(userId);

        List<Long> friendIds = friendships.stream()
                .map(f -> f.getRequester().getId().equals(userId)
                        ? f.getReceiver().getId()
                        : f.getRequester().getId())
                .toList();

        if (friendIds.isEmpty()) return List.of();

        return postRepository.findByUserIdInAndArchivedFalseOrderByCreatedAtDesc(friendIds);
    }

    // ── XP calculation ────────────────────────────────────────────────────────

    private int calculatePoints(Post.PostType postType, String title) {
        int base = switch (postType) {
            case TEXT     -> 10;
            case IMAGE    -> 20;
            case DOCUMENT -> 30;
            case VIDEO    -> 40;
        };
        int titleBonus = 0;
        if (title.length() >= 20 && title.length() <= 40) titleBonus = 5;
        else if (title.length() > 40)                      titleBonus = 10;
        return base + titleBonus;
    }
}
