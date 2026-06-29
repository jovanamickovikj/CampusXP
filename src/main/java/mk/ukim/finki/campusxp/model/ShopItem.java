package mk.ukim.finki.campusxp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shop_items")
public class ShopItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column
    private String imageUrl;

    @Column(nullable = false)
    private int pricePoints;

    /** Current remaining stock. Decremented on each purchase. */
    @Column(nullable = false)
    private int quantity;

    /** Stock at creation time — never changes after creation. */
    @Column(nullable = false)
    private int initialQuantity;

    /** Total number of purchases made for this item. */
    @Column(nullable = false)
    private int purchaseCount = 0;

    @Column(nullable = false)
    private boolean active = true;

    /**
     * The shop manager (or admin) who created this item.
     * Nullable for legacy seed items that predate the ownership feature.
     */
    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}
