package br.com.sistemacardapio.empresa;

import java.math.BigDecimal;
import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record EmpresaConfigRequest(
        @NotBlank @Size(max = 160) String nomeFantasia,
        @Size(max = 200) String razaoSocial,
        @Size(max = 20) String documento,
        @Size(max = 30) String telefone,
        @Size(max = 30) String whatsapp,
        @Email @Size(max = 254) String email,
        @Size(max = 1000) String descricao,
        @Size(max = 500) String endereco,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String corPrimaria,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String corSecundaria,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$") String corDestaque,
        boolean aceitaEntrega,
        boolean aceitaRetirada,
        @NotNull TipoTaxaEntrega tipoTaxaEntrega,
        @PositiveOrZero BigDecimal taxaEntregaFixa,
        @PositiveOrZero BigDecimal pedidoMinimo,
        @PositiveOrZero Integer tempoEntregaMin,
        @PositiveOrZero Integer tempoEntregaMax,
        @PositiveOrZero BigDecimal freteGratisAcima,
        @Size(max = 30) String tema,
        Map<String, String> redesSociais) {
    public EmpresaConfigRequest(String nomeFantasia,String razaoSocial,String documento,String telefone,String whatsapp,String email,String descricao,String endereco,String corPrimaria,String corSecundaria,String corDestaque,boolean aceitaEntrega,boolean aceitaRetirada,TipoTaxaEntrega tipoTaxaEntrega,BigDecimal taxaEntregaFixa,Map<String,String>redesSociais){this(nomeFantasia,razaoSocial,documento,telefone,whatsapp,email,descricao,endereco,corPrimaria,corSecundaria,corDestaque,aceitaEntrega,aceitaRetirada,tipoTaxaEntrega,taxaEntregaFixa,BigDecimal.ZERO,null,null,null,"AUTORAL",redesSociais);}
}
