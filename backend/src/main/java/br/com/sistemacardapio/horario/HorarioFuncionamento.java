package br.com.sistemacardapio.horario;

import java.time.LocalTime;
import java.util.UUID;

import br.com.sistemacardapio.empresa.Empresa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "horario_funcionamento")
public class HorarioFuncionamento {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "empresa_id") private Empresa empresa;
    @Column(name = "dia_semana", nullable = false) private int diaSemana;
    @Column(nullable = false) private boolean aberto;
    @Column(name = "hora_inicial") private LocalTime horaInicial;
    @Column(name = "hora_final") private LocalTime horaFinal;
    protected HorarioFuncionamento() {}
    public HorarioFuncionamento(Empresa empresa, int diaSemana) { this.id = UUID.randomUUID(); this.empresa = empresa; this.diaSemana = diaSemana; }
    public void configurar(boolean aberto, LocalTime inicio, LocalTime fim) { this.aberto = aberto; this.horaInicial = aberto ? inicio : null; this.horaFinal = aberto ? fim : null; }
    public int getDiaSemana() { return diaSemana; } public boolean isAberto() { return aberto; }
    public LocalTime getHoraInicial() { return horaInicial; } public LocalTime getHoraFinal() { return horaFinal; }
}

