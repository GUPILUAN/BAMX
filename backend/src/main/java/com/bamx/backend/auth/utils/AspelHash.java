package com.bamx.backend.auth.utils;

import java.util.HashMap;
import java.util.Map;

public class AspelHash {

  private static final Map<String, String> ASPEL_MAP = new HashMap<>();

  static {
    ASPEL_MAP.put("0", "\u201d");
    ASPEL_MAP.put("1", "\u2022");
    ASPEL_MAP.put("2", "\u2013");
    ASPEL_MAP.put("3", "\u2014");
    ASPEL_MAP.put("4", "\u02dc");
    ASPEL_MAP.put("5", "\u2122");
    ASPEL_MAP.put("6", "\u0161");
    ASPEL_MAP.put("7", "\u203a");
    ASPEL_MAP.put("8", "\u0153");
    ASPEL_MAP.put("9", "\ufffd");
    ASPEL_MAP.put("_", "\u00c3");

    ASPEL_MAP.put("a", "\u00a5");
    ASPEL_MAP.put("b", "\u00a6");
    ASPEL_MAP.put("c", "\u00a7");
    ASPEL_MAP.put("d", "\u00a8");
    ASPEL_MAP.put("e", "\u00a9");
    ASPEL_MAP.put("f", "\u00aa");
    ASPEL_MAP.put("g", "\u00ab");
    ASPEL_MAP.put("h", "\u00ac");
    ASPEL_MAP.put("i", "\u00ad");
    ASPEL_MAP.put("j", "\u00ae");
    ASPEL_MAP.put("k", "\u00af");
    ASPEL_MAP.put("l", "\u00b0");
    ASPEL_MAP.put("m", "\u00b1");
    ASPEL_MAP.put("n", "\u00b2");
    ASPEL_MAP.put("o", "\u00b3");
    ASPEL_MAP.put("p", "\u00b4");
    ASPEL_MAP.put("q", "\u00b5");
    ASPEL_MAP.put("r", "\u00b6");
    ASPEL_MAP.put("s", "\u00b7");
    ASPEL_MAP.put("t", "\u00b8");
    ASPEL_MAP.put("u", "\u00b9");
    ASPEL_MAP.put("v", "\u00ba");
    ASPEL_MAP.put("w", "\u00bb");
    ASPEL_MAP.put("x", "\u00bc");
    ASPEL_MAP.put("y", "\u00bd");
    ASPEL_MAP.put("z", "\u00be");
  }

  public static String hashAspel(String password) {
    password = password.toLowerCase();
    StringBuilder result = new StringBuilder();

    for (char c : password.toCharArray()) {
      String mapped = ASPEL_MAP.get(String.valueOf(c));
      result.append(mapped != null ? mapped : "?");
    }

    return result.toString();
  }

  public static String decode(String hashedPassword) {
    StringBuilder result = new StringBuilder();

    for (char c : hashedPassword.toCharArray()) {
      String originalChar =
          ASPEL_MAP.entrySet().stream()
              .filter(entry -> entry.getValue().equals(String.valueOf(c)))
              .map(Map.Entry::getKey)
              .findFirst()
              .orElse("?");
      result.append(originalChar);
    }

    return result.toString();
  }

  public static boolean verifyPassword(String rawPassword, String hashedPassword) {
    String hashedRawPassword = hashAspel(rawPassword);
    return hashedRawPassword.equals(hashedPassword);
  }
}
