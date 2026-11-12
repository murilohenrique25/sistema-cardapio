package br.com.sistemacardapio.promocao;
import java.util.*;import org.springframework.http.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;
@RestController@RequestMapping("/api/cupons")@PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class CupomController{private final CupomService s;public CupomController(CupomService s){this.s=s;}@GetMapping public List<CupomService.Response>listar(){return s.listar();}@PostMapping@ResponseStatus(HttpStatus.CREATED)public CupomService.Response criar(@RequestBody CupomService.Request r){return s.criar(r);}@PutMapping("/{id}")public CupomService.Response atualizar(@PathVariable UUID id,@RequestBody CupomService.Request r){return s.atualizar(id,r);}}
