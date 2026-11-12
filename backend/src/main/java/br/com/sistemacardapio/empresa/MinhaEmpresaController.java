package br.com.sistemacardapio.empresa;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/minha-empresa")
@PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class MinhaEmpresaController {

    private final MinhaEmpresaService service;

    public MinhaEmpresaController(MinhaEmpresaService service) {
        this.service = service;
    }

    @GetMapping
    public MinhaEmpresaService.EmpresaConfigResponse consultar() {
        return service.consultar();
    }

    @PutMapping
    public MinhaEmpresaService.EmpresaConfigResponse atualizar(@Valid @RequestBody EmpresaConfigRequest request) {
        return service.atualizar(request);
    }
}

