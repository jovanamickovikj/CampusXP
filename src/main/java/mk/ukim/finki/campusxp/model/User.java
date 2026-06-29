package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String fullName;

    /** Stored as BCrypt hash — never exposed in responses. */
    @Column(nullable = false)
    private String password;

    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false)
    private int currentPoints = 0;

    @Column(nullable = false)
    private int totalEarnedPoints = 0;

    /** Spring Security role — only USER or ADMIN exist. */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    /**
     * Application-level account type.
     * USER       — regular student (gamification enabled).
     * SHOP_MANAGER — applicant/verified shop manager (no gamification).
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountType accountType = AccountType.USER;

    /**
     * Only relevant when accountType == SHOP_MANAGER.
     * PENDING  — awaiting admin approval.
     * VERIFIED — approved; can manage shop items.
     * REJECTED — denied; treated like a regular USER for shop access.
     */
    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    // ── Enums ────────────────────────────────────────────────────────────────

    public enum Role { USER, ADMIN }

    public enum AccountType { USER, SHOP_MANAGER }

    public enum VerificationStatus { PENDING, VERIFIED, REJECTED }

    // ── Convenience helpers ───────────────────────────────────────────────────

    /** True for accounts that should never participate in gamification. */
    public boolean isPrivileged() {
        return role == Role.ADMIN || accountType == AccountType.SHOP_MANAGER;
    }

    /** True only for ADMIN accounts. */
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    /** True only for fully approved shop managers. */
    public boolean isVerifiedShopManager() {
        return accountType == AccountType.SHOP_MANAGER
                && verificationStatus == VerificationStatus.VERIFIED;
    }
}
