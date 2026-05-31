package mk.ukim.finki.campusxp.dto.response;

import mk.ukim.finki.campusxp.model.PointTransaction;

import java.time.LocalDateTime;

public record PointTransactionResponse(
        Long id,
        int amount,
        PointTransaction.TransactionType type,
        String reason,
        LocalDateTime createdAt
) {
}
