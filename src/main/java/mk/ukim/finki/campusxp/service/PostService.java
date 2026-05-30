package mk.ukim.finki.campusxp.service;

import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.model.Post;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final FriendshipService friendshipService;

    public PostService(PostRepository postRepository, UserService userService, FriendshipService friendshipService) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.friendshipService = friendshipService;
    }

    public Post createPost(Long userId, String title, String description,
                           String fileUrl, Post.PostType postType) {

        User user = userService.findById(userId);
        int points = calculatePoints(postType, title);

        Post post = new Post();
        post.setUser(user);
        post.setTitle(title);
        post.setDescription(description);
        post.setFileUrl(fileUrl);
        post.setPostType(postType);
        post.setPointsAwarded(points);

        Post saved = postRepository.save(post);
        userService.addPoints(userId, points);
        return saved;
    }

    public List<Post> getPostsForUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Post> getFriendsFeed(Long userId) {
        List<Friendship> friendships = friendshipService.getFriends(userId);

        List<Long> friendIds = friendships.stream()
                .map(f -> f.getRequester().getId().equals(userId)
                ? f.getReceiver().getId()
                : f.getRequester().getId())
                .toList();

        if (friendIds.isEmpty()) {
            return List.of();
        }

        return postRepository.findByUserIdInOrderByCreatedAtDesc(friendIds);
    }

    private int calculatePoints(Post.PostType postType, String title) {
        int base = switch (postType){
            case TEXT -> 10;
            case IMAGE -> 20;
            case DOCUMENT -> 30;
            case VIDEO -> 40;
        };
        int titleBonus = 0;
        if(title.length() >= 20 && title.length() <= 40)
            titleBonus = 5;
        else if(title.length() > 40)
            titleBonus = 10;

        return base+titleBonus;
    }
}
