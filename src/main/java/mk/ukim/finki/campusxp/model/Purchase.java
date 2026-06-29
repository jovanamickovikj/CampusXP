package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shop_item_id")
    private ShopItem shopItem;

    @Column(nullable = false)
    private int pointsPaid;

    @Column(nullable = false)
    private LocalDateTime purchasedAt = LocalDateTime.now();

    /** Whether the item has been redeemed/used. */
    @Column(nullable = false)
    private boolean used = false;

    /** When the item was redeemed (null until used). */
    @Column
    private LocalDateTime usedAt;
}
