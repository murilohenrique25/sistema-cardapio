package br.com.sistemacardapio.horario;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/horarios") @PreAuthorize("hasRole('ADMIN_EMPRESA')")
public class HorarioController {
    private final HorarioService service; public HorarioController(HorarioService service) { this.service = service; }
    @GetMapping public List<HorarioService.HorarioResponse> listar() { return service.listar(); }
    @PutMapping public List<HorarioService.HorarioResponse> salvar(@RequestBody List<HorarioService.HorarioRequest> requests) { return service.salvar(requests); }
}

