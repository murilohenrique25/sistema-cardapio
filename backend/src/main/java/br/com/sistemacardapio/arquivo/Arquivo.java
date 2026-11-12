package br.com.sistemacardapio.arquivo;

import java.time.Instant;
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
@Table(name = "arquivo")
public class Arquivo {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
    @Column(name = "nome_original", nullable = false)
    private String nomeOriginal;
    @Column(name = "tipo_mime", nullable = false, length = 100)
    private String tipoMime;
    @Column(name = "tamanho_bytes", nullable = false)
    private long tamanhoBytes;
    @Column(name = "hash_sha256", nullable = false, length = 64)
    private String hashSha256;
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] conteudo;
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Arquivo() {}

    public Arquivo(Empresa empresa, String nomeOriginal, String tipoMime, byte[] conteudo, String hashSha256) {
        this.id = UUID.randomUUID();
        this.empresa = empresa;
        this.nomeOriginal = nomeOriginal;
        this.tipoMime = tipoMime;
        this.tamanhoBytes = conteudo.length;
        this.conteudo = conteudo;
        this.hashSha256 = hashSha256;
        this.criadoEm = Instant.now();
    }

    public UUID getId() { return id; }
    public Empresa getEmpresa() { return empresa; }
    public String getTipoMime() { return tipoMime; }
    public long getTamanhoBytes() { return tamanhoBytes; }
    public String getHashSha256() { return hashSha256; }
    public byte[] getConteudo() { return conteudo; }
}

