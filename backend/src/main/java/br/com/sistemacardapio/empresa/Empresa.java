package br.com.sistemacardapio.empresa;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import br.com.sistemacardapio.arquivo.Arquivo;

@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(name = "nome_fantasia", nullable = false, length = 160)
    private String nomeFantasia;

    @Column(name = "razao_social", length = 200)
    private String razaoSocial;

    @Column(length = 20)
    private String documento;

    @Column(length = 30)
    private String telefone;

    @Column(length = 30)
    private String whatsapp;

    @Column(length = 254)
    private String email;

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(length = 500)
    private String endereco;

    @Column(name = "cor_primaria", nullable = false, length = 7)
    private String corPrimaria;

    @Column(name = "cor_secundaria", nullable = false, length = 7)
    private String corSecundaria;

    @Column(name = "cor_destaque", nullable = false, length = 7)
    private String corDestaque;

    @Column(name = "aceita_entrega", nullable = false)
    private boolean aceitaEntrega;

    @Column(name = "aceita_retirada", nullable = false)
    private boolean aceitaRetirada;

    @Column(name = "tipo_taxa_entrega", nullable = false, length = 30)
    private String tipoTaxaEntrega;

    @Column(name = "taxa_entrega_fixa", precision = 12, scale = 2)
    private java.math.BigDecimal taxaEntregaFixa;

    @Column(name = "pedido_minimo", nullable = false, precision = 12, scale = 2)
    private java.math.BigDecimal pedidoMinimo;
    @Column(name = "tempo_entrega_min") private Integer tempoEntregaMin;
    @Column(name = "tempo_entrega_max") private Integer tempoEntregaMax;
    @Column(name = "frete_gratis_acima", precision = 12, scale = 2) private java.math.BigDecimal freteGratisAcima;
    @Column(nullable = false, length = 30) private String tema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logo_arquivo_id")
    private Arquivo logoArquivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banner_arquivo_id")
    private Arquivo bannerArquivo;

    @Column(nullable = false)
    private boolean ativa;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Empresa() {
    }

    public Empresa(String slug, String nomeFantasia) {
        this.id = UUID.randomUUID();
        this.slug = slug;
        this.nomeFantasia = nomeFantasia;
        this.corPrimaria = "#E85D04";
        this.corSecundaria = "#370617";
        this.corDestaque = "#FFBA08";
        this.aceitaEntrega = true;
        this.aceitaRetirada = true;
        this.tipoTaxaEntrega = "TAXA_FIXA";
        this.pedidoMinimo = java.math.BigDecimal.ZERO;
        this.tema = "AUTORAL";
        this.ativa = true;
        this.criadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public String getRazaoSocial() { return razaoSocial; }
    public String getDocumento() { return documento; }
    public String getTelefone() { return telefone; }
    public String getWhatsapp() { return whatsapp; }
    public String getEmail() { return email; }
    public String getDescricao() { return descricao; }
    public String getEndereco() { return endereco; }
    public String getCorPrimaria() { return corPrimaria; }
    public String getCorSecundaria() { return corSecundaria; }
    public String getCorDestaque() { return corDestaque; }
    public boolean isAceitaEntrega() { return aceitaEntrega; }
    public boolean isAceitaRetirada() { return aceitaRetirada; }
    public String getTipoTaxaEntrega() { return tipoTaxaEntrega; }
    public java.math.BigDecimal getTaxaEntregaFixa() { return taxaEntregaFixa; }
    public java.math.BigDecimal getPedidoMinimo() { return pedidoMinimo; }
    public Integer getTempoEntregaMin() { return tempoEntregaMin; }
    public Integer getTempoEntregaMax() { return tempoEntregaMax; }
    public java.math.BigDecimal getFreteGratisAcima() { return freteGratisAcima; }
    public String getTema() { return tema; }
    public Arquivo getLogoArquivo() { return logoArquivo; }
    public Arquivo getBannerArquivo() { return bannerArquivo; }
    public void definirLogo(Arquivo arquivo) { this.logoArquivo = arquivo; }
    public void definirBanner(Arquivo arquivo) { this.bannerArquivo = arquivo; }

    public void atualizarConfiguracao(EmpresaConfigRequest request) {
        this.nomeFantasia = request.nomeFantasia().trim();
        this.razaoSocial = limpar(request.razaoSocial());
        this.documento = limpar(request.documento());
        this.telefone = limpar(request.telefone());
        this.whatsapp = limpar(request.whatsapp());
        this.email = limpar(request.email());
        this.descricao = limpar(request.descricao());
        this.endereco = limpar(request.endereco());
        this.corPrimaria = request.corPrimaria().toUpperCase();
        this.corSecundaria = request.corSecundaria().toUpperCase();
        this.corDestaque = request.corDestaque().toUpperCase();
        this.aceitaEntrega = request.aceitaEntrega();
        this.aceitaRetirada = request.aceitaRetirada();
        this.tipoTaxaEntrega = request.tipoTaxaEntrega().name();
        this.taxaEntregaFixa = request.tipoTaxaEntrega() == TipoTaxaEntrega.TAXA_FIXA
                ? request.taxaEntregaFixa() : null;
        this.pedidoMinimo = request.pedidoMinimo() == null ? java.math.BigDecimal.ZERO : request.pedidoMinimo();
        this.tempoEntregaMin = request.tempoEntregaMin();
        this.tempoEntregaMax = request.tempoEntregaMax();
        this.freteGratisAcima = request.freteGratisAcima();
        this.tema = request.tema() == null || request.tema().isBlank() ? "AUTORAL" : request.tema().toUpperCase();
    }

    private String limpar(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
