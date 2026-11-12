package br.com.sistemacardapio.empresa;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class MinhaEmpresaService {

    private static final Set<String> REDES_PERMITIDAS = Set.of("INSTAGRAM", "FACEBOOK", "TIKTOK", "SITE");
    private final EmpresaRepository empresaRepository;
    private final RedeSocialRepository redeSocialRepository;
    private final TenantContext tenantContext;

    public MinhaEmpresaService(EmpresaRepository empresaRepository, RedeSocialRepository redeSocialRepository,
            TenantContext tenantContext) {
        this.empresaRepository = empresaRepository;
        this.redeSocialRepository = redeSocialRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public EmpresaConfigResponse consultar() {
        UUID empresaId = tenantContext.empresaIdObrigatoria();
        Empresa empresa = empresaRepository.findById(empresaId).orElseThrow();
        return response(empresa);
    }

    @Transactional
    public EmpresaConfigResponse atualizar(EmpresaConfigRequest request) {
        validar(request);
        UUID empresaId = tenantContext.empresaIdObrigatoria();
        Empresa empresa = empresaRepository.findById(empresaId).orElseThrow();
        empresa.atualizarConfiguracao(request);

        redeSocialRepository.deleteAllByEmpresaId(empresaId);
        if (request.redesSociais() != null) {
            request.redesSociais().forEach((tipo, url) -> {
                String tipoNormalizado = tipo.toUpperCase();
                if (!REDES_PERMITIDAS.contains(tipoNormalizado)) {
                    throw new IllegalStateException("Rede social não permitida: " + tipo);
                }
                if (url != null && !url.isBlank()) {
                    String limpa = url.trim();
                    if (!(limpa.startsWith("https://") || limpa.startsWith("http://"))) {
                        throw new IllegalStateException("Links de redes sociais devem iniciar com http:// ou https://");
                    }
                    redeSocialRepository.save(new RedeSocial(empresa, tipoNormalizado, limpa));
                }
            });
        }
        return response(empresa);
    }

    private void validar(EmpresaConfigRequest request) {
        if (!request.aceitaEntrega() && !request.aceitaRetirada()) {
            throw new IllegalStateException("Habilite entrega ou retirada");
        }
        if (!request.aceitaEntrega() && request.tipoTaxaEntrega() != TipoTaxaEntrega.SEM_ENTREGA) {
            throw new IllegalStateException("Empresa sem entrega deve usar a opção sem entrega");
        }
        if (request.tipoTaxaEntrega() == TipoTaxaEntrega.TAXA_FIXA && request.taxaEntregaFixa() == null) {
            throw new IllegalStateException("Informe a taxa fixa de entrega");
        }
        if (request.tempoEntregaMin() != null && request.tempoEntregaMax() != null && request.tempoEntregaMax() < request.tempoEntregaMin()) {
            throw new IllegalStateException("O tempo máximo deve ser maior ou igual ao mínimo");
        }
    }

    private EmpresaConfigResponse response(Empresa empresa) {
        Map<String, String> redes = new LinkedHashMap<>();
        redeSocialRepository.findAllByEmpresaIdAndAtivaTrue(empresa.getId())
                .forEach(rede -> redes.put(rede.getTipo(), rede.getUrl()));
        return new EmpresaConfigResponse(
                empresa.getId(), empresa.getSlug(), empresa.getNomeFantasia(), empresa.getRazaoSocial(),
                empresa.getDocumento(), empresa.getTelefone(), empresa.getWhatsapp(), empresa.getEmail(),
                empresa.getDescricao(), empresa.getEndereco(), empresa.getCorPrimaria(), empresa.getCorSecundaria(),
                empresa.getCorDestaque(), empresa.isAceitaEntrega(), empresa.isAceitaRetirada(),
                TipoTaxaEntrega.valueOf(empresa.getTipoTaxaEntrega()), empresa.getTaxaEntregaFixa(),
                empresa.getPedidoMinimo(), empresa.getTempoEntregaMin(), empresa.getTempoEntregaMax(), empresa.getFreteGratisAcima(), empresa.getTema(), redes,
                empresa.getLogoArquivo() == null ? null : empresa.getLogoArquivo().getId(),
                empresa.getBannerArquivo() == null ? null : empresa.getBannerArquivo().getId());
    }

    public record EmpresaConfigResponse(
            UUID id, String slug, String nomeFantasia, String razaoSocial, String documento, String telefone,
            String whatsapp, String email, String descricao, String endereco, String corPrimaria,
            String corSecundaria, String corDestaque, boolean aceitaEntrega, boolean aceitaRetirada,
            TipoTaxaEntrega tipoTaxaEntrega, BigDecimal taxaEntregaFixa, BigDecimal pedidoMinimo,
            Integer tempoEntregaMin, Integer tempoEntregaMax, BigDecimal freteGratisAcima, String tema,
            Map<String, String> redesSociais, UUID logoArquivoId, UUID bannerArquivoId) {}
}
