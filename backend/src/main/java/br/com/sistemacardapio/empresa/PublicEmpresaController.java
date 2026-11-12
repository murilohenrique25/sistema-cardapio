package br.com.sistemacardapio.empresa;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/empresas")
public class PublicEmpresaController {

    private final EmpresaRepository empresaRepository;

    public PublicEmpresaController(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<EmpresaPublicaResponse> buscarPorSlug(@PathVariable String slug) {
        return empresaRepository.findBySlugAndAtivaTrue(slug)
                .map(empresa -> ResponseEntity.ok(new EmpresaPublicaResponse(
                        empresa.getId(), empresa.getSlug(), empresa.getNomeFantasia())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record EmpresaPublicaResponse(java.util.UUID id, String slug, String nomeFantasia) {
    }
}

