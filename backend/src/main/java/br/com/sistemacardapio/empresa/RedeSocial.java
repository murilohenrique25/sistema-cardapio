package br.com.sistemacardapio.empresa;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rede_social")
public class RedeSocial {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
    @Column(nullable = false, length = 30)
    private String tipo;
    @Column(nullable = false, length = 500)
    private String url;
    @Column(nullable = false)
    private boolean ativa;

    protected RedeSocial() {}
    public RedeSocial(Empresa empresa, String tipo, String url) {
        this.id = UUID.randomUUID();
        this.empresa = empresa;
        this.tipo = tipo;
        this.url = url;
        this.ativa = true;
    }
    public String getTipo() { return tipo; }
    public String getUrl() { return url; }
}

