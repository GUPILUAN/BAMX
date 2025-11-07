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

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.bamx.backend.auth.repositories",
    entityManagerFactoryRef = "authEntityManager",
    transactionManagerRef = "authTransactionManager")
public class AuthDbConfig {

  @Bean
  @ConfigurationProperties("spring.datasource.auth")
  public DataSourceProperties authDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Bean
  public DataSource authDataSource() {
    return authDataSourceProperties().initializeDataSourceBuilder().build();
  }

  @Bean(name = "authEntityManager")
  public LocalContainerEntityManagerFactoryBean authEntityManager() {

    HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();

    Map<String, Object> props = new HashMap<>();

    props.put("hibernate.dialect", "org.hibernate.community.dialect.FirebirdDialect");

    LocalContainerEntityManagerFactoryBean emf = new LocalContainerEntityManagerFactoryBean();
    emf.setDataSource(authDataSource());
    emf.setPackagesToScan("com.bamx.backend.auth.models");
    emf.setJpaVendorAdapter(vendorAdapter);
    emf.setJpaPropertyMap(props);
    emf.setPersistenceUnitName("authPU");

    return emf;
  }

  @Bean(name = "authTransactionManager")
  public PlatformTransactionManager authTransactionManager(
      @Qualifier("authEntityManager") LocalContainerEntityManagerFactoryBean authEmf) {
    return new JpaTransactionManager(Objects.requireNonNull(authEmf.getObject()));
  }
}
