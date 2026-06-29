package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A regular User (follower) following a Shop Manager (following).
 * Completely separate from the Friendship model — shop managers are never friends.
 */
@Entity
@Table(name = "follows",
       uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"}))
@Getter @Setter @NoArgsConstructor
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Regular USER who is following the shop manager. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    /** SHOP_MANAGER being followed. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    @Column(nullable = false)
    private LocalDateTime followedAt = LocalDateTime.now();
}
