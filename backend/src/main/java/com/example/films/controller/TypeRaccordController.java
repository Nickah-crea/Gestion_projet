package com.example.films.controller;

import com.example.films.entity.TypeRaccord;
import com.example.films.service.TypeRaccordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/types-raccord")
@CrossOrigin(origins = "http://localhost:5173")
public class TypeRaccordController {
    
    private final TypeRaccordService typeRaccordService;
    
    public TypeRaccordController(TypeRaccordService typeRaccordService) {
        this.typeRaccordService = typeRaccordService;
    }
    
    @GetMapping
    public List<TypeRaccord> getAllTypes() {
        return typeRaccordService.getAllTypes();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TypeRaccord> getTypeById(@PathVariable Long id) {
        TypeRaccord type = typeRaccordService.getTypeById(id);
        return ResponseEntity.ok(type);
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<TypeRaccord> getTypeByCode(@PathVariable String code) {
        TypeRaccord type = typeRaccordService.getTypeByCode(code);
        return ResponseEntity.ok(type);
    }
    
    @PostMapping
    public ResponseEntity<TypeRaccord> createType(@RequestBody TypeRaccord typeRaccord) {
        TypeRaccord createdType = typeRaccordService.createType(typeRaccord);
        return new ResponseEntity<>(createdType, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TypeRaccord> updateType(@PathVariable Long id, @RequestBody TypeRaccord typeRaccord) {
        TypeRaccord updatedType = typeRaccordService.updateType(id, typeRaccord);
        return ResponseEntity.ok(updatedType);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        typeRaccordService.deleteType(id);
        return ResponseEntity.noContent().build();
    }
}

