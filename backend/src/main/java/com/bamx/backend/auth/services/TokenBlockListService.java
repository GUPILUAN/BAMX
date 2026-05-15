package com.bamx.backend.auth.services;

import com.bamx.backend.auth.models.TokenBlockList;
import com.bamx.backend.auth.repositories.TokenBlockListRepository;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class TokenBlockListService {
  private static final Logger logger = LoggerFactory.getLogger(TokenBlockListService.class);
  private static final String TABLE_NAME = "TOKEN_BLOCK_LIST";

  private final TokenBlockListRepository tokenBlockListRepository;
  private final ObjectProvider<DataSource> authDataSourceProvider;
  private volatile Boolean tableAvailable;

  public TokenBlockListService(
      TokenBlockListRepository tokenBlockListRepository,
      @Qualifier("authDataSource") ObjectProvider<DataSource> authDataSourceProvider) {
    this.tokenBlockListRepository = tokenBlockListRepository;
    this.authDataSourceProvider = authDataSourceProvider;
  }

  public boolean isRevoked(String jti) {
    if (!isTableAvailable()) {
      return false;
    }

    try {
      return tokenBlockListRepository.findByJti(jti).isPresent();
    } catch (DataAccessException ex) {
      markUnavailable("checking token revocation", ex);
      return false;
    }
  }

  public boolean revoke(TokenBlockList token) {
    if (!isTableAvailable()) {
      return true;
    }

    try {
      return tokenBlockListRepository.save(token) != null;
    } catch (DataAccessException ex) {
      markUnavailable("persisting revoked token", ex);
      return true;
    }
  }

  private boolean isTableAvailable() {
    Boolean current = tableAvailable;
    if (current != null) {
      return current;
    }

    synchronized (this) {
      if (tableAvailable == null) {
        tableAvailable = detectTableAvailability();
      }
      return tableAvailable;
    }
  }

  private boolean detectTableAvailability() {
    DataSource authDataSource = authDataSourceProvider.getIfAvailable();
    if (authDataSource == null) {
      logger.warn("authDataSource is unavailable; token revocation is disabled for this run.");
      return false;
    }

    try (Connection connection = authDataSource.getConnection();
        PreparedStatement statement =
            connection.prepareStatement(
                "select 1 from RDB$RELATIONS where RDB$RELATION_NAME = ?");
        ResultSet resultSet = executeTableLookup(statement)) {
      if (resultSet.next()) {
        return true;
      }

      logger.warn("{} table was not found; token revocation is disabled for this run.", TABLE_NAME);
      return false;
    } catch (SQLException ex) {
      logger.warn(
          "Could not inspect {} table; token revocation is disabled for this run. Cause: {}",
          TABLE_NAME,
          ex.getMessage());
      return false;
    }
  }

  private ResultSet executeTableLookup(PreparedStatement statement) throws SQLException {
    statement.setString(1, TABLE_NAME);
    return statement.executeQuery();
  }

  private void markUnavailable(String action, DataAccessException ex) {
    tableAvailable = false;
    logger.warn(
        "Failed while {}; token revocation is disabled for this run. Cause: {}",
        action,
        ex.getMostSpecificCause().getMessage());
  }
}
