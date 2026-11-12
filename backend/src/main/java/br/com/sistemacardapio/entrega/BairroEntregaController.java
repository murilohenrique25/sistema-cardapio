package br.com.sistemacardapio.entrega;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bairros-entrega")
@PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class BairroEntregaController {
    private final BairroEntregaService service;
    public BairroEntregaController(BairroEntregaService service) { this.service = service; }
    @GetMapping public List<BairroEntregaService.BairroResponse> listar() { return service.listar(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public BairroEntregaService.BairroResponse criar(@Valid @RequestBody BairroEntregaService.BairroRequest request) { return service.criar(request); }
    @PutMapping("/{id}")
    public BairroEntregaService.BairroResponse atualizar(@PathVariable UUID id, @Valid @RequestBody BairroEntregaService.BairroRequest request) { return service.atualizar(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(@PathVariable UUID id) { service.inativar(id); }
}

