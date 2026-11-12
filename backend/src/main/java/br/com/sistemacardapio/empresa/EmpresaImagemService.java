package br.com.sistemacardapio.empresa;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.sistemacardapio.arquivo.Arquivo;
import br.com.sistemacardapio.arquivo.ArquivoService;
import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class EmpresaImagemService {
    private final EmpresaRepository empresaRepository;
    private final ArquivoService arquivoService;
    private final TenantContext tenantContext;

    public EmpresaImagemService(EmpresaRepository empresaRepository, ArquivoService arquivoService,
            TenantContext tenantContext) {
        this.empresaRepository = empresaRepository;
        this.arquivoService = arquivoService;
        this.tenantContext = tenantContext;
    }

    @Transactional
    public ImagemResponse upload(TipoImagemEmpresa tipo, MultipartFile file) {
        Empresa empresa = empresaRepository.findById(tenantContext.empresaIdObrigatoria()).orElseThrow();
        Arquivo arquivo = arquivoService.armazenarImagem(empresa, file);
        if (tipo == TipoImagemEmpresa.LOGO) empresa.definirLogo(arquivo); else empresa.definirBanner(arquivo);
        return new ImagemResponse(arquivo.getId(), "/api/public/arquivos/" + arquivo.getId());
    }

    public enum TipoImagemEmpresa { LOGO, BANNER }
    public record ImagemResponse(UUID arquivoId, String url) {}
}

