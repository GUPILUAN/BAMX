package com.bamx.backend.auth.repositories;

import com.bamx.backend.auth.models.UsrEmp;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsrEmpRepository extends JpaRepository<UsrEmp, Integer> {
  Optional<UsrEmp> findByIdUsr(Integer id);
}
