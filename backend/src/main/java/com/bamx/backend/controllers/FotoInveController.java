package com.bamx.backend.controllers;

import com.bamx.backend.dtos.FotoInveDto;
import com.bamx.backend.services.FotoInveService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/fotos-inventarios")
@RequiredArgsConstructor
public class FotoInveController {
  private final FotoInveService fotoInveService;

  @GetMapping("/all")
  public ResponseEntity<List<FotoInveDto>> getAllFotoInve() {
    return ResponseEntity.ok(fotoInveService.getAllFotoInve());
  }

  @Value("${app.images.path}")
  private String imagesPath;

  @GetMapping(value = "/{cveArt}")
  public ResponseEntity<byte[]> getArticleImage(@PathVariable String cveArt) throws IOException {
    byte[] bytes;

    bytes = fotoInveService.getFotoByCveArt(cveArt);

    if (bytes != null) {
      return ResponseEntity.ok()
          .contentType(Objects.requireNonNull(MediaType.IMAGE_JPEG))
          .body(bytes);
    }

    Path path = Paths.get(imagesPath + cveArt + ".jpg");
    if (!Files.exists(path)) {
      return ResponseEntity.notFound().build();
    }
    bytes = Files.readAllBytes(path);
    String mime = Files.probeContentType(path);

    if (mime == null) {
      mime = "application/octet-stream";
    }
    return ResponseEntity.ok().contentType(MediaType.parseMediaType(mime)).body(bytes);
  }
}
