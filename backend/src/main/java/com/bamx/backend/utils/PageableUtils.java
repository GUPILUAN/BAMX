package com.bamx.backend.utils;

import com.bamx.backend.dtos.response.PageResponse;
import org.springframework.data.domain.Page;

public class PageableUtils {
  public static <T> PageResponse<T> convertToPageResponse(Page<T> page) {
    return new PageResponse<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }
}
