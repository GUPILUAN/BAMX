package com.bamx.backend.config;

import java.util.*;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.*;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Profile("!test")
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.bamx.backend.repositories",
    entityManagerFactoryRef = "empresaEntityManager",
    transactionManagerRef = "empresaTransactionManager")
public class EmpresaDbConfig {

  @Bean
  @ConfigurationProperties("spring.datasource.empresa")
  public DataSourceProperties empresaDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Bean
  public DataSource empresaDataSource() {
    return empresaDataSourceProperties().initializeDataSourceBuilder().build();
  }

  @Bean(name = "empresaEntityManager")
  public LocalContainerEntityManagerFactoryBean empresaEntityManager() {

    HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();

    Map<String, Object> props = new HashMap<>();
    props.put(
        "hibernate.physical_naming_strategy",
        "com.bamx.backend.config.EmpresaPhysicalNamingStrategy");
    props.put("hibernate.session_factory.statement_inspector", new EmpresaSqlStatementInspector());
    props.put("hibernate.dialect", "org.hibernate.community.dialect.FirebirdDialect");
    LocalContainerEntityManagerFactoryBean emf = new LocalContainerEntityManagerFactoryBean();
    emf.setDataSource(empresaDataSource());
    emf.setPackagesToScan("com.bamx.backend.models");
    emf.setJpaVendorAdapter(vendorAdapter);
    emf.setJpaPropertyMap(props);
    emf.setPersistenceUnitName("empresaPU");

    return emf;
  }

  @Bean(name = "empresaTransactionManager")
  public PlatformTransactionManager empresaTransactionManager(
      @Qualifier("empresaEntityManager") LocalContainerEntityManagerFactoryBean empresaEmf) {
    return new JpaTransactionManager(Objects.requireNonNull(empresaEmf.getObject()));
  }
}
