package br.com.sistemacardapio.empresa;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/minha-empresa/imagens")
@PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class EmpresaImagemController {
    private final EmpresaImagemService service;
    public EmpresaImagemController(EmpresaImagemService service) { this.service = service; }

    @PostMapping("/logo")
    public EmpresaImagemService.ImagemResponse logo(@RequestParam("file") MultipartFile file) {
        return service.upload(EmpresaImagemService.TipoImagemEmpresa.LOGO, file);
    }

    @PostMapping("/banner")
    public EmpresaImagemService.ImagemResponse banner(@RequestParam("file") MultipartFile file) {
        return service.upload(EmpresaImagemService.TipoImagemEmpresa.BANNER, file);
    }
}

