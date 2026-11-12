package br.com.sistemacardapio.catalogo;
import java.util.UUID;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;import org.springframework.web.multipart.MultipartFile;
@RestController @RequestMapping("/api/produtos") @PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class ProdutoImagemController{private final ProdutoImagemService service;public ProdutoImagemController(ProdutoImagemService service){this.service=service;}@PostMapping("/{id}/imagem")public ProdutoImagemService.Response upload(@PathVariable UUID id,@RequestParam("file")MultipartFile file){return service.upload(id,file);}}
