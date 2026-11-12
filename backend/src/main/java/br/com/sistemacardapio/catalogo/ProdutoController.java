package br.com.sistemacardapio.catalogo;
import java.util.*;import org.springframework.http.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;import jakarta.validation.Valid;
@RestController @RequestMapping("/api/produtos") @PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class ProdutoController{
 private final ProdutoService service;public ProdutoController(ProdutoService service){this.service=service;}
 @GetMapping public List<ProdutoService.Response> listar(){return service.listar();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ProdutoService.Response criar(@Valid @RequestBody ProdutoService.Request r){return service.criar(r);}
 @PutMapping("/{id}")public ProdutoService.Response atualizar(@PathVariable UUID id,@Valid @RequestBody ProdutoService.Request r){return service.atualizar(id,r);}
 @DeleteMapping("/{id}")@ResponseStatus(HttpStatus.NO_CONTENT)public void inativar(@PathVariable UUID id){service.inativar(id);}
}

