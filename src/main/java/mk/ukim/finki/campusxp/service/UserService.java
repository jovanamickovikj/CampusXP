package mk.ukim.finki.campusxp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.campusxp.exception.BadRequestException;
import mk.ukim.finki.campusxp.exception.ResourceNotFoundException;
import mk.ukim.finki.campusxp.model.PointTransaction;
import mk.ukim.finki.campusxp.model.User;
import mk.ukim.finki.campusxp.repository.PointTransactionRepository;
import mk.ukim.finki.campusxp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PointTransactionRepository pointTransactionRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    /**
     * Creates a new user with an already-encoded password.
     * Enforces unique username and email constraints at the application level.
     */
    @Transactional
    public User createUserWithPassword(String username, String email, String fullName,
                                       String encodedPassword, User.Role role,
                                       User.AccountType accountType) {
        if (userRepository.existsByUsername(username))
            throw new BadRequestException("Username already taken");
        if (userRepository.existsByEmail(email))
            throw new BadRequestException("Email already taken");

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(encodedPassword);
        user.setRole(role);
        user.setAccountType(accountType != null ? accountType : User.AccountType.USER);

        if (user.getAccountType() == User.AccountType.SHOP_MANAGER) {
            user.setVerificationStatus(User.VerificationStatus.PENDING);
        }

        User saved = userRepository.save(user);
        log.info("New user registered: username={}, accountType={}", saved.getUsername(), saved.getAccountType());
        return saved;
    }

    @Transactional
    public User updateUser(Long id, String username, String fullName, String email,
                           String avatarUrl, String bio) {
        User user = findById(id);

        if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username))
                throw new BadRequestException("Username already taken");
            user.setUsername(username);
        }
        if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
        if (email != null && !email.isBlank() && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmail(email))
                throw new BadRequestException("Email already taken");
            user.setEmail(email);
        }
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl.isBlank() ? null : avatarUrl);
        if (bio != null) user.setBio(bio.isBlank() ? null : bio);

        log.debug("User profile updated: id={}", id);
        return userRepository.save(user);
    }

    // ── Shop Manager Approval ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<User> getPendingShopManagers() {
        return userRepository.findByAccountTypeAndVerificationStatusOrderByIdAsc(
                User.AccountType.SHOP_MANAGER, User.VerificationStatus.PENDING);
    }

    @Transactional
    public User verifyShopManager(Long targetId, User.VerificationStatus newStatus) {
        User user = findById(targetId);
        if (user.getAccountType() != User.AccountType.SHOP_MANAGER)
            throw new BadRequestException("This user is not a shop manager applicant");
        if (user.getVerificationStatus() == User.VerificationStatus.VERIFIED
                && newStatus == User.VerificationStatus.VERIFIED)
            throw new BadRequestException("User is already verified");

        user.setVerificationStatus(newStatus);
        log.info("Shop manager {} set to {}", targetId, newStatus);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        if (user.getRole() == User.Role.ADMIN)
            throw new BadRequestException("Cannot delete an ADMIN account");
        log.warn("Deleting user: id={}, username={}", id, user.getUsername());
        userRepository.delete(user);
    }

    // ── Points ────────────────────────────────────────────────────────────────

    @Transactional
    public void addPoints(Long userId, int points, String reason) {
        User user = findById(userId);
        user.setCurrentPoints(user.getCurrentPoints() + points);
        user.setTotalEarnedPoints(user.getTotalEarnedPoints() + points);
        userRepository.save(user);

        PointTransaction tx = new PointTransaction();
        tx.setUser(user);
        tx.setAmount(points);
        tx.setType(PointTransaction.TransactionType.EARNED);
        tx.setReason(reason);
        pointTransactionRepository.save(tx);

        log.debug("Points added: userId={}, amount={}, reason={}", userId, points, reason);
    }

    @Transactional
    public void spendPoints(Long userId, int points, String reason) {
        User user = findById(userId);
        if (user.getCurrentPoints() < points)
            throw new BadRequestException("Not enough points");

        user.setCurrentPoints(user.getCurrentPoints() - points);
        userRepository.save(user);

        PointTransaction tx = new PointTransaction();
        tx.setUser(user);
        tx.setAmount(points);
        tx.setType(PointTransaction.TransactionType.SPEND);
        tx.setReason(reason);
        pointTransactionRepository.save(tx);

        log.debug("Points spent: userId={}, amount={}, reason={}", userId, points, reason);
    }

    @Transactional(readOnly = true)
    public List<PointTransaction> getPointHistory(Long userId) {
        return pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
