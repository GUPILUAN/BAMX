package com.bamx.backend.auth.repositories;

import com.bamx.backend.auth.models.UsrEmp;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsrEmpRepository extends JpaRepository<UsrEmp, Integer> {
  // Un usuario de Aspel tiene una fila por sistema (SAE, NOI, COI...) y por
  // empresa: en BAMX, ADMINISTRADOR tiene 16. Nunca asumir que hay una sola.
  List<UsrEmp> findByIdUsrOrderByIdUsrEmp(Integer idUsr);
}
