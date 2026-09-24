package com.bamx.backend.auth.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.bamx.backend.auth.models.UsrEmp;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class UsuarioServiceSelectUsrEmpTest {

  private static UsrEmp fila(int id, int idSist, int empresa, int idRol) {
    return UsrEmp.builder().idUsrEmp(id).idUsr(0).idSist(idSist).empresa(empresa).idRol(idRol).status(0).build();
  }

  @Test
  void administradorDeBamxConUnaFilaPorSistemaTomaLaDeSae() {
    // Caso real de PERFILES.FDB en el servidor de BAMX (2026-09-24): 16 filas, todas EMPRESA 0.
    int[] sistemas = {1001, 1002, 1003, 1004, 1005, 2003, 2005, 3001, 3004, 3005, 3006, 3007, 3008, 3010, 3011, 3012};
    List<UsrEmp> filas = new ArrayList<>();
    for (int i = 0; i < sistemas.length; i++) {
      filas.add(fila(i + 1, sistemas[i], 0, 0));
    }

    UsrEmp elegida = UsuarioService.selectUsrEmp(filas, 3).orElseThrow();

    assertEquals(1005, elegida.getIdSist());
  }

  @Test
  void prefiereLaEmpresaConfiguradaSobreLaGenerica() {
    List<UsrEmp> filas = List.of(fila(1, 1005, 0, 7), fila(2, 1005, 5, 8), fila(3, 1005, 3, 9));

    assertEquals(9, UsuarioService.selectUsrEmp(filas, 3).orElseThrow().getIdRol());
  }

  @Test
  void sinFilaDeSaeUsaLaPrimeraComoAntes() {
    List<UsrEmp> filas = List.of(fila(1, 3001, 2, 4), fila(2, 2003, 2, 5));

    assertEquals(4, UsuarioService.selectUsrEmp(filas, 3).orElseThrow().getIdRol());
  }

  @Test
  void sinFilasNoHayAsociacion() {
    assertTrue(UsuarioService.selectUsrEmp(List.of(), 3).isEmpty());
  }
}
