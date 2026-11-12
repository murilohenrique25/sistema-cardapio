package br.com.sistemacardapio.catalogo;
import java.util.*;import org.springframework.http.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;import jakarta.validation.Valid;
@RestController @RequestMapping("/api/categorias") @PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class CategoriaController{
 private final CategoriaService service;public CategoriaController(CategoriaService service){this.service=service;}
 @GetMapping public List<CategoriaService.Response> listar(){return service.listar();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public CategoriaService.Response criar(@Valid @RequestBody CategoriaService.Request r){return service.criar(r);}
 @PutMapping("/{id}") public CategoriaService.Response atualizar(@PathVariable UUID id,@Valid @RequestBody CategoriaService.Request r){return service.atualizar(id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void inativar(@PathVariable UUID id){service.inativar(id);}
}

