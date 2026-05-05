package com.bamx.backend.config;

import java.util.regex.Pattern;
import org.hibernate.resource.jdbc.spi.StatementInspector;

public class EmpresaSqlStatementInspector implements StatementInspector {

  private static final String[] EMPRESA_TABLES = {
    "ALMACENES",
    "CLIN",
    "CONM",
    "CVES_ALTER",
    "ENLACE_LTPD",
    "FOTO_INVE",
    "INVE",
    "LTPD",
    "MINVE",
    "MULT",
    "NUMSER",
    "PAIS",
    "PROV",
    "TBLCONTROL"
  };

  @Override
  public String inspect(String sql) {
    String suffix = EmpresaPhysicalNamingStrategy.getEmpresa();
    if (EmpresaPhysicalNamingStrategy.DEFAULT_EMPRESA_SUFFIX.equals(suffix)) {
      return sql;
    }

    String rewrittenSql = sql;
    for (String table : EMPRESA_TABLES) {
      String defaultTableName = table + EmpresaPhysicalNamingStrategy.DEFAULT_EMPRESA_SUFFIX;
      rewrittenSql =
          rewrittenSql.replaceAll(
              "(?i)\\b" + Pattern.quote(defaultTableName) + "\\b", table + suffix);
    }
    return rewrittenSql;
  }
}
