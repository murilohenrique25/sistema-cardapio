package br.com.sistemacardapio.catalogo;

import java.time.Instant;
import java.util.UUID;
import br.com.sistemacardapio.empresa.Empresa;
import jakarta.persistence.*;

@Entity @Table(name="categoria")
public class Categoria {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="empresa_id") private Empresa empresa;
 @Column(nullable=false,length=120) private String nome;
 @Column(length=500) private String descricao;
 @Column(nullable=false) private int ordem;
 @Column(nullable=false) private boolean ativa;
 @Column(name="criado_em",nullable=false,updatable=false) private Instant criadoEm;
 protected Categoria(){}
 public Categoria(Empresa empresa,String nome,String descricao,int ordem){this.id=UUID.randomUUID();this.empresa=empresa;this.criadoEm=Instant.now();atualizar(nome,descricao,ordem,true);}
 public void atualizar(String nome,String descricao,int ordem,boolean ativa){this.nome=nome.trim();this.descricao=descricao==null||descricao.isBlank()?null:descricao.trim();this.ordem=ordem;this.ativa=ativa;}
 public UUID getId(){return id;} public String getNome(){return nome;} public String getDescricao(){return descricao;} public int getOrdem(){return ordem;} public boolean isAtiva(){return ativa;}
}

