package br.com.sistemacardapio.autenticacao;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthService.LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request.email(), request.senha()));
    }

    @GetMapping("/me")
    public UsuarioPrincipal me(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return principal;
    }

    @PostMapping("/alterar-senha")
    public AuthService.LoginResponse alterarSenha(@AuthenticationPrincipal UsuarioPrincipal principal, @Valid @RequestBody AlterarSenhaRequest request) {
        return authService.alterarSenha(principal, request.senhaAtual(), request.novaSenha());
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String senha) {}
    public record AlterarSenhaRequest(@NotBlank String senhaAtual, @NotBlank String novaSenha) {}
}
