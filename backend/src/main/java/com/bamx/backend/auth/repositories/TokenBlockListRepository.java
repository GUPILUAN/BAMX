package com.bamx.backend.auth.repositories;

import com.bamx.backend.auth.models.TokenBlockList;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenBlockListRepository extends JpaRepository<TokenBlockList, Integer> {
  Optional<TokenBlockList> findByJti(String jti);
}
