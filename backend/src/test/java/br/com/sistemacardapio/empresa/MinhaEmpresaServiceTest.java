package br.com.sistemacardapio.empresa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import br.com.sistemacardapio.tenant.TenantContext;

class MinhaEmpresaServiceTest {

    @Test
    void deveAtualizarSomenteAEmpresaDoContextoAutenticado() {
        Empresa empresa = new Empresa("alabama", "Alabama");
        EmpresaRepository empresaRepository = mock(EmpresaRepository.class);
        RedeSocialRepository redeRepository = mock(RedeSocialRepository.class);
        TenantContext tenantContext = mock(TenantContext.class);
        when(tenantContext.empresaIdObrigatoria()).thenReturn(empresa.getId());
        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(redeRepository.findAllByEmpresaIdAndAtivaTrue(empresa.getId())).thenReturn(java.util.List.of());

        var service = new MinhaEmpresaService(empresaRepository, redeRepository, tenantContext);
        var request = new EmpresaConfigRequest(
                "Novo Alabama", null, null, null, "5562999999999", null, null, null,
                "#112233", "#445566", "#778899", true, true, TipoTaxaEntrega.TAXA_FIXA,
                new BigDecimal("7.50"), Map.of("INSTAGRAM", "https://instagram.com/alabama"));

        var response = service.atualizar(request);

        assertThat(response.id()).isEqualTo(empresa.getId());
        assertThat(response.nomeFantasia()).isEqualTo("Novo Alabama");
        assertThat(response.taxaEntregaFixa()).isEqualByComparingTo("7.50");
        verify(redeRepository).deleteAllByEmpresaId(empresa.getId());
    }
}

