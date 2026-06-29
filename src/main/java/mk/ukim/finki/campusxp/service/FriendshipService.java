package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.Friendship;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.FriendshipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserService userService;

    @Transactional
    public Friendship sendRequest(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId))
            throw new BadRequestException("You cannot send a friend request to yourself");
        if (friendshipRepository.findBetweenUsers(requesterId, receiverId).isPresent())
            throw new BadRequestException("A friendship or pending request already exists");

        User requester = userService.findById(requesterId);
        User receiver  = userService.findById(receiverId);

        if (requester.getAccountType() == User.AccountType.SHOP_MANAGER)
            throw new BadRequestException("Shop managers cannot send friend requests");
        if (receiver.getAccountType() == User.AccountType.SHOP_MANAGER)
            throw new BadRequestException("Shop managers cannot receive friend requests — use Follow instead");

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);

        Friendship saved = friendshipRepository.save(friendship);
        log.debug("Friend request sent: from={} to={}", requesterId, receiverId);
        return saved;
    }

    @Transactional
    public Friendship acceptRequest(Long friendshipId) {
        Friendship friendship = getFriendship(friendshipId);
        friendship.setStatus(Friendship.Status.ACCEPTED);
        log.debug("Friend request accepted: id={}", friendshipId);
        return friendshipRepository.save(friendship);
    }

    @Transactional
    public void removeFriendship(Long friendshipId) {
        Friendship friendship = getFriendship(friendshipId);
        log.debug("Friendship removed: id={}", friendshipId);
        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getFriends(Long userId) {
        return friendshipRepository.findAcceptedFriendships(userId);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getPendingRequests(Long userId) {
        return friendshipRepository.findPendingRequestsForUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getSentPendingRequests(Long userId) {
        return friendshipRepository.findSentPendingByUser(userId);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getAllInvolvingUser(Long userId) {
        return friendshipRepository.findAllInvolvingUser(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Friendship> findBetween(Long userA, Long userB) {
        return friendshipRepository.findBetweenUsers(userA, userB);
    }

    @Transactional(readOnly = true)
    public Friendship getFriendship(Long friendshipId) {
        return friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));
    }
}
