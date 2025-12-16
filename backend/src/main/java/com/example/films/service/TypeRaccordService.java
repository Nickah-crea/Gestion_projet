package com.example.films.service;

import com.example.films.entity.TypeRaccord;
import com.example.films.repository.TypeRaccordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TypeRaccordService {
    
    private final TypeRaccordRepository typeRaccordRepository;
    
    public TypeRaccordService(TypeRaccordRepository typeRaccordRepository) {
        this.typeRaccordRepository = typeRaccordRepository;
    }
    
    public List<TypeRaccord> getAllTypes() {
        return typeRaccordRepository.findAll();
    }
    
    public TypeRaccord getTypeById(Long id) {
        return typeRaccordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type raccord non trouvé avec l'ID: " + id));
    }
    
    public TypeRaccord getTypeByCode(String code) {
        return typeRaccordRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Type raccord non trouvé avec le code: " + code));
    }
    
    public TypeRaccord createType(TypeRaccord typeRaccord) {
        // Vérifier si le code existe déjà
        if (typeRaccordRepository.findByCode(typeRaccord.getCode()).isPresent()) {
            throw new RuntimeException("Un type avec le code " + typeRaccord.getCode() + " existe déjà");
        }
        
        // Vérifier si le nom existe déjà
        if (typeRaccordRepository.findByNomType(typeRaccord.getNomType()).isPresent()) {
            throw new RuntimeException("Un type avec le nom " + typeRaccord.getNomType() + " existe déjà");
        }
        
        return typeRaccordRepository.save(typeRaccord);
    }
    
    public TypeRaccord updateType(Long id, TypeRaccord typeDetails) {
        TypeRaccord typeRaccord = getTypeById(id);
        
        // Vérifier si le nouveau code existe déjà pour un autre type
        if (!typeRaccord.getCode().equals(typeDetails.getCode()) &&
            typeRaccordRepository.findByCode(typeDetails.getCode()).isPresent()) {
            throw new RuntimeException("Un autre type avec le code " + typeDetails.getCode() + " existe déjà");
        }
        
        // Vérifier si le nouveau nom existe déjà pour un autre type
        if (!typeRaccord.getNomType().equals(typeDetails.getNomType()) &&
            typeRaccordRepository.findByNomType(typeDetails.getNomType()).isPresent()) {
            throw new RuntimeException("Un autre type avec le nom " + typeDetails.getNomType() + " existe déjà");
        }
        
        // Mettre à jour les champs
        typeRaccord.setCode(typeDetails.getCode());
        typeRaccord.setNomType(typeDetails.getNomType());
        typeRaccord.setDescription(typeDetails.getDescription());
        
        return typeRaccordRepository.save(typeRaccord);
    }
    
    public void deleteType(Long id) {
        TypeRaccord typeRaccord = getTypeById(id);
        typeRaccordRepository.delete(typeRaccord);
    }
}

