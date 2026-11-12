package br.com.sistemacardapio.empresa;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/empresas")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class EmpresaAdminController {

    private final EmpresaAdminService service;

    public EmpresaAdminController(EmpresaAdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmpresaAdminService.EmpresaResponse> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<EmpresaAdminService.EmpresaResponse> criar(
            @Valid @RequestBody EmpresaAdminService.CriarEmpresaRequest request) {
        var response = service.criar(request);
        return ResponseEntity.created(URI.create("/api/admin/empresas/" + response.id())).body(response);
    }
}

