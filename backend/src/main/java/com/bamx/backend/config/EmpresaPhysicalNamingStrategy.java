package com.bamx.backend.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class EmpresaPhysicalNamingStrategy implements PhysicalNamingStrategy {

  public static final String DEFAULT_EMPRESA_SUFFIX = "01";

  private static final ThreadLocal<String> empresaSuffix =
      ThreadLocal.withInitial(() -> DEFAULT_EMPRESA_SUFFIX);

  public static void setEmpresa(String sufijo) {
    empresaSuffix.set(normalizeEmpresaSuffix(sufijo));
  }

  public static String getEmpresa() {
    return empresaSuffix.get();
  }

  public static void clear() {
    empresaSuffix.remove();
  }

  private static String normalizeEmpresaSuffix(String sufijo) {
    if (sufijo == null || sufijo.isBlank()) {
      return DEFAULT_EMPRESA_SUFFIX;
    }
    String normalized = sufijo.trim();
    return normalized.length() == 1 ? "0" + normalized : normalized;
  }

  @Override
  public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {

    return Identifier.toIdentifier(name.getText() + DEFAULT_EMPRESA_SUFFIX);
  }

  @Override
  public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment context) {
    return name;
  }

  @Override
  public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment context) {
    return name;
  }

  @Override
  public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment context) {
    return name;
  }

  @Override
  public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment context) {
    return name;
  }
}
