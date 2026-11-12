package br.com.sistemacardapio.autenticacao;

import java.util.UUID;

public record UsuarioPrincipal(
        UUID usuarioId,
        UUID empresaId,
        String nome,
        String email,
        PerfilUsuario perfil,
        boolean trocaSenhaObrigatoria) {
}
