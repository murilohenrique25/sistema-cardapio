package br.com.sistemacardapio.horario;
import static org.assertj.core.api.Assertions.assertThat;import static org.mockito.Mockito.*;import java.time.*;import java.util.*;import org.junit.jupiter.api.Test;import br.com.sistemacardapio.empresa.*;import br.com.sistemacardapio.tenant.TenantContext;
class HorarioServiceTest{
 @Test void deveConsiderarAbertoDepoisDaMeiaNoitePeloHorarioDoDiaAnterior(){UUID empresa=UUID.randomUUID();Empresa e=new Empresa("teste","Teste");HorarioFuncionamento sexta=new HorarioFuncionamento(e,5);sexta.configurar(true,LocalTime.of(18,0),LocalTime.of(1,0));HorarioRepository repo=mock(HorarioRepository.class);when(repo.findByEmpresaIdAndDiaSemana(empresa,6)).thenReturn(Optional.empty());when(repo.findByEmpresaIdAndDiaSemana(empresa,5)).thenReturn(Optional.of(sexta));HorarioService service=new HorarioService(repo,mock(EmpresaRepository.class),mock(TenantContext.class));assertThat(service.estaAberta(empresa,LocalDateTime.of(2026,8,29,0,30))).isTrue();}
}
