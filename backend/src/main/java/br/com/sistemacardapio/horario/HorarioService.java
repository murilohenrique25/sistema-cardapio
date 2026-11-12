package br.com.sistemacardapio.horario;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemacardapio.empresa.Empresa;
import br.com.sistemacardapio.empresa.EmpresaRepository;
import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class HorarioService {
    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private final HorarioRepository repository; private final EmpresaRepository empresaRepository; private final TenantContext tenant;
    public HorarioService(HorarioRepository repository, EmpresaRepository empresaRepository, TenantContext tenant) { this.repository = repository; this.empresaRepository = empresaRepository; this.tenant = tenant; }

    @Transactional(readOnly = true)
    public List<HorarioResponse> listar() { return completar(tenant.empresaIdObrigatoria()); }

    @Transactional
    public List<HorarioResponse> salvar(List<HorarioRequest> requests) {
        if (requests.size() != 7 || requests.stream().map(HorarioRequest::diaSemana).distinct().count() != 7) throw new IllegalStateException("Informe os sete dias da semana");
        UUID empresaId = tenant.empresaIdObrigatoria(); Empresa empresa = empresaRepository.findById(empresaId).orElseThrow();
        for (HorarioRequest request : requests) {
            if (request.diaSemana() < 1 || request.diaSemana() > 7) throw new IllegalStateException("Dia da semana inválido");
            if (request.aberto() && (request.horaInicial() == null || request.horaFinal() == null || request.horaInicial().equals(request.horaFinal()))) throw new IllegalStateException("Horário aberto exige início e fim diferentes");
            HorarioFuncionamento horario = repository.findByEmpresaIdAndDiaSemana(empresaId, request.diaSemana()).orElseGet(() -> new HorarioFuncionamento(empresa, request.diaSemana()));
            horario.configurar(request.aberto(), request.horaInicial(), request.horaFinal()); repository.save(horario);
        }
        return completar(empresaId);
    }

    @Transactional(readOnly = true)
    public boolean estaAberta(UUID empresaId, LocalDateTime agora) {
        int dia = agora.getDayOfWeek().getValue(); LocalTime hora = agora.toLocalTime();
        var hoje = repository.findByEmpresaIdAndDiaSemana(empresaId, dia).orElse(null);
        if (hoje != null && hoje.isAberto() && dentro(hora, hoje.getHoraInicial(), hoje.getHoraFinal())) return true;
        int anterior = dia == DayOfWeek.MONDAY.getValue() ? 7 : dia - 1;
        var ontem = repository.findByEmpresaIdAndDiaSemana(empresaId, anterior).orElse(null);
        return ontem != null && ontem.isAberto() && ontem.getHoraFinal().isBefore(ontem.getHoraInicial()) && hora.isBefore(ontem.getHoraFinal());
    }

    public boolean estaAbertaAgora(UUID empresaId) { return estaAberta(empresaId, LocalDateTime.now(ZONE)); }
    private boolean dentro(LocalTime atual, LocalTime inicio, LocalTime fim) { return fim.isAfter(inicio) ? !atual.isBefore(inicio) && atual.isBefore(fim) : !atual.isBefore(inicio); }
    private List<HorarioResponse> completar(UUID empresaId) {
        var existentes = repository.findAllByEmpresaIdOrderByDiaSemanaAsc(empresaId); List<HorarioResponse> result = new ArrayList<>();
        for (int day = 1; day <= 7; day++) { final int current = day; result.add(existentes.stream().filter(h -> h.getDiaSemana() == current).findFirst().map(HorarioResponse::from).orElse(new HorarioResponse(day, false, null, null))); }
        return result;
    }
    public record HorarioRequest(int diaSemana, boolean aberto, LocalTime horaInicial, LocalTime horaFinal) {}
    public record HorarioResponse(int diaSemana, boolean aberto, LocalTime horaInicial, LocalTime horaFinal) { static HorarioResponse from(HorarioFuncionamento h) { return new HorarioResponse(h.getDiaSemana(), h.isAberto(), h.getHoraInicial(), h.getHoraFinal()); } }
}

