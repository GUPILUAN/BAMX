package com.bamx.backend.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategy;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class EmpresaPhysicalNamingStrategy implements PhysicalNamingStrategy {

  private static final ThreadLocal<String> empresaSuffix = ThreadLocal.withInitial(() -> "01");

  public static void setEmpresa(String sufijo) {
    empresaSuffix.set(sufijo);
  }

  public static void clear() {
    empresaSuffix.remove();
  }

  @Override
  public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment context) {

    return Identifier.toIdentifier(name.getText() + empresaSuffix.get());
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
