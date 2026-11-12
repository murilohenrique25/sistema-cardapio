package br.com.sistemacardapio.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import br.com.sistemacardapio.arquivo.Arquivo;
import br.com.sistemacardapio.empresa.Empresa;
import jakarta.persistence.*;

@Entity @Table(name="produto")
public class Produto {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="empresa_id") private Empresa empresa;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="categoria_id") private Categoria categoria;
 @Column(nullable=false,length=160) private String nome;
 @Column(columnDefinition="text") private String descricao;
 @Column(name="codigo_interno",length=80) private String codigoInterno;
 @Column(nullable=false,precision=12,scale=2) private BigDecimal preco;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="imagem_arquivo_id") private Arquivo imagemArquivo;
 @Column(nullable=false) private int ordem;
 @Column(nullable=false) private boolean ativo;
 @Column(nullable=false) private boolean disponivel;
 @Column(name="criado_em",nullable=false,updatable=false) private Instant criadoEm;
 @Column(name="atualizado_em",nullable=false) private Instant atualizadoEm;
 protected Produto(){}
 public Produto(Empresa empresa,Categoria categoria,String nome,String descricao,String codigo,BigDecimal preco,int ordem){this.id=UUID.randomUUID();this.empresa=empresa;this.criadoEm=Instant.now();atualizar(categoria,nome,descricao,codigo,preco,ordem,true,true);}
 public void atualizar(Categoria categoria,String nome,String descricao,String codigo,BigDecimal preco,int ordem,boolean ativo,boolean disponivel){this.categoria=categoria;this.nome=nome.trim();this.descricao=limpar(descricao);this.codigoInterno=limpar(codigo);this.preco=preco;this.ordem=ordem;this.ativo=ativo;this.disponivel=disponivel;this.atualizadoEm=Instant.now();}
 public void definirImagem(Arquivo arquivo){this.imagemArquivo=arquivo;this.atualizadoEm=Instant.now();}
 private String limpar(String s){return s==null||s.isBlank()?null:s.trim();}
 @Column(name="regra_preco",nullable=false,length=30)private String regraPreco="SOMA";
 public UUID getId(){return id;} public Empresa getEmpresa(){return empresa;} public Categoria getCategoria(){return categoria;} public String getNome(){return nome;} public String getDescricao(){return descricao;} public String getCodigoInterno(){return codigoInterno;} public BigDecimal getPreco(){return preco;} public Arquivo getImagemArquivo(){return imagemArquivo;} public int getOrdem(){return ordem;} public boolean isAtivo(){return ativo;} public boolean isDisponivel(){return disponivel;} public String getRegraPreco(){return regraPreco;}
 public void definirRegraPreco(String regra){this.regraPreco=java.util.Set.of("MAIOR_COMPLEMENTO","MEDIA_COMPLEMENTOS").contains(regra)?regra:"SOMA";}
}
