package br.com.sistemacardapio.autenticacao;

import java.time.Instant;
import java.util.UUID;

import br.com.sistemacardapio.empresa.Empresa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false, length = 160)
    private String nome;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PerfilUsuario perfil;

    @Column(nullable = false)
    private boolean ativo;

    @Column(name = "troca_senha_obrigatoria", nullable = false)
    private boolean trocaSenhaObrigatoria;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Usuario() {
    }

    private Usuario(String nome, String email, String senhaHash, PerfilUsuario perfil, Empresa empresa) {
        this.id = UUID.randomUUID();
        this.nome = nome;
        this.email = email.trim().toLowerCase();
        this.senhaHash = senhaHash;
        this.perfil = perfil;
        this.empresa = empresa;
        this.ativo = true;
        this.trocaSenhaObrigatoria = perfil == PerfilUsuario.ADMIN_EMPRESA;
        this.criadoEm = Instant.now();
    }

    public static Usuario superAdmin(String nome, String email, String senhaHash) {
        return new Usuario(nome, email, senhaHash, PerfilUsuario.SUPER_ADMIN, null);
    }

    public static Usuario administradorEmpresa(String nome, String email, String senhaHash, Empresa empresa) {
        return new Usuario(nome, email, senhaHash, PerfilUsuario.ADMIN_EMPRESA, empresa);
    }

    public UUID getId() { return id; }
    public Empresa getEmpresa() { return empresa; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public PerfilUsuario getPerfil() { return perfil; }
    public boolean isAtivo() { return ativo; }
    public boolean isTrocaSenhaObrigatoria() { return trocaSenhaObrigatoria; }
    public void alterarSenha(String senhaHash, boolean exigirNovaTroca) { this.senhaHash = senhaHash; this.trocaSenhaObrigatoria = exigirNovaTroca; }
    public void atualizar(String nome, boolean ativo) { this.nome = nome.trim(); this.ativo = ativo; }
}
