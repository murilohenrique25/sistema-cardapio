package br.com.sistemacardapio.entrega;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemacardapio.empresa.Empresa;
import br.com.sistemacardapio.empresa.EmpresaRepository;
import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class BairroEntregaService {
    private final BairroEntregaRepository repository;
    private final EmpresaRepository empresaRepository;
    private final TenantContext tenantContext;

    public BairroEntregaService(BairroEntregaRepository repository, EmpresaRepository empresaRepository,
            TenantContext tenantContext) {
        this.repository = repository; this.empresaRepository = empresaRepository; this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public List<BairroResponse> listar() {
        return repository.findAllByEmpresaIdOrderByOrdemAscNomeAsc(tenantContext.empresaIdObrigatoria())
                .stream().map(BairroResponse::from).toList();
    }

    @Transactional
    public BairroResponse criar(BairroRequest request) {
        UUID empresaId = tenantContext.empresaIdObrigatoria();
        if (repository.existsByEmpresaIdAndNomeIgnoreCase(empresaId, request.nome())) {
            throw new IllegalStateException("Bairro já cadastrado");
        }
        Empresa empresa = empresaRepository.findById(empresaId).orElseThrow();
        return BairroResponse.from(repository.save(new BairroEntrega(empresa, request.nome(), request.taxa(), request.ordem())));
    }

    @Transactional
    public BairroResponse atualizar(UUID id, BairroRequest request) {
        UUID empresaId = tenantContext.empresaIdObrigatoria();
        BairroEntrega bairro = repository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new IllegalStateException("Bairro não encontrado"));
        bairro.atualizar(request.nome(), request.taxa(), request.ordem(), request.ativo());
        return BairroResponse.from(bairro);
    }

    @Transactional
    public void inativar(UUID id) {
        UUID empresaId = tenantContext.empresaIdObrigatoria();
        BairroEntrega bairro = repository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new IllegalStateException("Bairro não encontrado"));
        bairro.atualizar(bairro.getNome(), bairro.getTaxa(), bairro.getOrdem(), false);
    }

    public record BairroRequest(
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 120) String nome,
            @jakarta.validation.constraints.NotNull @jakarta.validation.constraints.PositiveOrZero BigDecimal taxa,
            @jakarta.validation.constraints.PositiveOrZero int ordem,
            boolean ativo) {}
    public record BairroResponse(UUID id, String nome, BigDecimal taxa, int ordem, boolean ativo) {
        static BairroResponse from(BairroEntrega bairro) {
            return new BairroResponse(bairro.getId(), bairro.getNome(), bairro.getTaxa(), bairro.getOrdem(), bairro.isAtivo());
        }
    }
}

