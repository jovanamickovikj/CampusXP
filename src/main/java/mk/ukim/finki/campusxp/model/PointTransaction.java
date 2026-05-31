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
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private TransactionType type;

    private LocalDateTime createdAt =  LocalDateTime.now();

    public enum TransactionType{
        EARNED,
        SPEND
    }
}
