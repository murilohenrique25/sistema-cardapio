package br.com.sistemacardapio.arquivo;

import java.time.Duration;
import java.util.UUID;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/arquivos")
public class PublicArquivoController {
    private final ArquivoRepository repository;
    public PublicArquivoController(ArquivoRepository repository) { this.repository = repository; }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> obter(@PathVariable UUID id) {
        return repository.findById(id)
                .map(file -> ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType(file.getTipoMime()))
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                        .eTag('"' + file.getHashSha256() + '"')
                        .body(file.getConteudo()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

