package br.com.sistemacardapio.entrega;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import br.com.sistemacardapio.empresa.EmpresaRepository;
import br.com.sistemacardapio.tenant.TenantContext;

class BairroEntregaServiceTest {
    @Test
    void naoDeveAtualizarBairroDeOutraEmpresa() {
        UUID empresaAutenticada = UUID.randomUUID();
        UUID bairroDeOutraEmpresa = UUID.randomUUID();
        BairroEntregaRepository repository = mock(BairroEntregaRepository.class);
        TenantContext tenant = mock(TenantContext.class);
        when(tenant.empresaIdObrigatoria()).thenReturn(empresaAutenticada);
        when(repository.findByIdAndEmpresaId(bairroDeOutraEmpresa, empresaAutenticada)).thenReturn(Optional.empty());
        var service = new BairroEntregaService(repository, mock(EmpresaRepository.class), tenant);
        var request = new BairroEntregaService.BairroRequest("Centro", new BigDecimal("5.00"), 0, true);

        assertThatThrownBy(() -> service.atualizar(bairroDeOutraEmpresa, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não encontrado");
    }
}

