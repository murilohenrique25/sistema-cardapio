package br.com.sistemacardapio.autenticacao;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

@Service
public class JwtService {

    private final Algorithm algorithm;
    private final JWTVerifier verifier;
    private final String issuer;
    private final long expirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        if (secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET deve possuir ao menos 32 caracteres");
        }
        this.algorithm = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
        this.verifier = JWT.require(algorithm).withIssuer(issuer).build();
    }

    public String gerar(Usuario usuario) {
        Instant agora = Instant.now();
        var builder = JWT.create()
                .withIssuer(issuer)
                .withSubject(usuario.getId().toString())
                .withIssuedAt(agora)
                .withExpiresAt(agora.plus(expirationMinutes, ChronoUnit.MINUTES))
                .withClaim("nome", usuario.getNome())
                .withClaim("email", usuario.getEmail())
                .withClaim("perfil", usuario.getPerfil().name())
                .withClaim("troca_senha", usuario.isTrocaSenhaObrigatoria());

        if (usuario.getEmpresa() != null) {
            builder.withClaim("empresa_id", usuario.getEmpresa().getId().toString());
        }
        return builder.sign(algorithm);
    }

    public UsuarioPrincipal validar(String token) {
        DecodedJWT jwt = verifier.verify(token);
        String empresaClaim = jwt.getClaim("empresa_id").asString();
        return new UsuarioPrincipal(
                UUID.fromString(jwt.getSubject()),
                empresaClaim == null ? null : UUID.fromString(empresaClaim),
                jwt.getClaim("nome").asString(),
                jwt.getClaim("email").asString(),
                PerfilUsuario.valueOf(jwt.getClaim("perfil").asString()),
                Boolean.TRUE.equals(jwt.getClaim("troca_senha").asBoolean()));
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }
}
