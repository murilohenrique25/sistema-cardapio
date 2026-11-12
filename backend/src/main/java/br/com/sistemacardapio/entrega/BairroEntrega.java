package br.com.sistemacardapio.entrega;

import java.math.BigDecimal;
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
@Table(name = "bairro_entrega")
public class BairroEntrega {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
    @Column(nullable = false, length = 120) private String nome;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal taxa;
    @Column(nullable = false) private int ordem;
    @Column(nullable = false) private boolean ativo;

    protected BairroEntrega() {}
    public BairroEntrega(Empresa empresa, String nome, BigDecimal taxa, int ordem) {
        this.id = UUID.randomUUID(); this.empresa = empresa; this.ativo = true;
        atualizar(nome, taxa, ordem, true);
    }
    public void atualizar(String nome, BigDecimal taxa, int ordem, boolean ativo) {
        this.nome = nome.trim(); this.taxa = taxa; this.ordem = ordem; this.ativo = ativo;
    }
    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public BigDecimal getTaxa() { return taxa; }
    public int getOrdem() { return ordem; }
    public boolean isAtivo() { return ativo; }
}

