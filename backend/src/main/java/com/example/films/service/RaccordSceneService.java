package com.example.films.service;

import com.example.films.dto.*;
import com.example.films.entity.*;
import com.example.films.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaccordSceneService {
    
    private final RaccordRepository raccordRepository;
    private final RaccordImageRepository raccordImageRepository;
    private final SceneRepository sceneRepository;
    private final TypeRaccordRepository typeRaccordRepository;
    private final StatutRaccordRepository statutRaccordRepository;
    private final SceneStatutRepository sceneStatutRepository;
    private final PersonnageRepository personnageRepository;
    private final ComedienRepository comedienRepository;
    
   @Transactional
    public RaccordDTO createRaccordAvecPhotosExistantes(CreateRaccordSceneDTO createRaccordSceneDTO) {
    // Vérifier que les scènes existent
    Scene sceneSource = sceneRepository.findById(createRaccordSceneDTO.getSceneSourceId())
            .orElseThrow(() -> new RuntimeException("Scène source non trouvée"));
    Scene sceneCible = sceneRepository.findById(createRaccordSceneDTO.getSceneCibleId())
            .orElseThrow(() -> new RuntimeException("Scène cible non trouvée"));
    
    // Récupérer le personnage (peut être null)
    Personnage personnage = null;
    if (createRaccordSceneDTO.getPersonnageId() != null) {
        personnage = personnageRepository.findById(createRaccordSceneDTO.getPersonnageId())
                .orElseThrow(() -> new RuntimeException("Personnage non trouvé"));
    }
    
    // Récupérer le comédien (peut être null)
    Comedien comedien = null;
    if (createRaccordSceneDTO.getComedienId() != null) {
        comedien = comedienRepository.findById(createRaccordSceneDTO.getComedienId())
                .orElseThrow(() -> new RuntimeException("Comédien non trouvé"));
    }

    Raccord dernierRaccordCree = null;
    
    // Pour chaque type sélectionné, créer un raccord
    for (Long typeId : createRaccordSceneDTO.getTypesRaccord()) {
        TypeRaccord typeRaccord = typeRaccordRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Type de raccord non trouvé"));
        
        StatutRaccord statutRaccord = statutRaccordRepository.findById(createRaccordSceneDTO.getStatutRaccordId())
                .orElseThrow(() -> new RuntimeException("Statut de raccord non trouvé"));
        
        // Vérifier si un raccord existe déjà pour ce type entre ces scènes
        if (raccordRepository.existsByScenesAndType(
                createRaccordSceneDTO.getSceneSourceId(),
                createRaccordSceneDTO.getSceneCibleId(),
                typeId)) {
            throw new RuntimeException("Un raccord de type " + typeRaccord.getNomType() + " existe déjà entre ces scènes");
        }
        
        // Créer le raccord
        Raccord raccord = new Raccord();
        raccord.setSceneSource(sceneSource);
        raccord.setSceneCible(sceneCible);
        raccord.setTypeRaccord(typeRaccord);
        raccord.setDescription(createRaccordSceneDTO.getDescription());
        raccord.setEstCritique(createRaccordSceneDTO.getEstCritique());
        raccord.setStatutRaccord(statutRaccord);
        raccord.setPersonnage(personnage);  
        raccord.setComedien(comedien);     
        
        Raccord savedRaccord = raccordRepository.save(raccord);
        dernierRaccordCree = savedRaccord;
        
        // Associer les photos existantes à ce raccord
        if (createRaccordSceneDTO.getPhotosIds() != null && !createRaccordSceneDTO.getPhotosIds().isEmpty()) {
            for (Long photoId : createRaccordSceneDTO.getPhotosIds()) {
                RaccordImage image = raccordImageRepository.findById(photoId)
                        .orElseThrow(() -> new RuntimeException("Photo non trouvée"));
                
                // Vérifier que la photo correspond au type de raccord
                if (image.getRaccord().getTypeRaccord().getId().equals(typeId)) {
                    // Créer une nouvelle instance de l'image pour ce raccord 
                    RaccordImage newImage = new RaccordImage();
                    newImage.setRaccord(savedRaccord);
                    newImage.setNomFichier(image.getNomFichier());
                    newImage.setCheminFichier(image.getCheminFichier());
                    newImage.setDescriptionImage(image.getDescriptionImage());
                    newImage.setEstImageReference(true);
                    
                    raccordImageRepository.save(newImage);
                }
            }
        }
    }
    
    // Retourner le dernier raccord créé
    if (dernierRaccordCree != null) {
        return convertToDTO(dernierRaccordCree);
    } else {
        throw new RuntimeException("Aucun raccord n'a été créé");
    }
}
    
    @Transactional(readOnly = true)
    public List<RaccordImageDTO> getPhotosByScene(Long sceneId) {
        List<Raccord> raccords = raccordRepository.findBySceneId(sceneId);
        return raccords.stream()
                .flatMap(raccord -> raccord.getImages().stream())
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SceneDTO> getScenesByProjet(Long projetId) {
        List<Scene> scenes = sceneRepository.findByProjetId(projetId);
        return scenes.stream()
                .map(this::convertSceneToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SceneDTO> getScenesByEpisode(Long episodeId) {
        List<Scene> scenes = sceneRepository.findByEpisodeId(episodeId);
        return scenes.stream()
                .map(this::convertSceneToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SceneDTO> getScenesBySequence(Long sequenceId) {
        List<Scene> scenes = sceneRepository.findBySequenceId(sequenceId);
        return scenes.stream()
                .map(this::convertSceneToDTO)
                .collect(Collectors.toList());
    }
    
    private RaccordDTO convertToDTO(Raccord raccord) {
        RaccordDTO dto = new RaccordDTO();
        dto.setId(raccord.getId());
        dto.setSceneSourceId(raccord.getSceneSource().getId());
        dto.setSceneSourceTitre(raccord.getSceneSource().getTitre());
        dto.setSceneCibleId(raccord.getSceneCible().getId());
        dto.setSceneCibleTitre(raccord.getSceneCible().getTitre());
        dto.setTypeRaccordId(raccord.getTypeRaccord().getId());
        dto.setTypeRaccordNom(raccord.getTypeRaccord().getNomType());
        dto.setDescription(raccord.getDescription());
        dto.setEstCritique(raccord.getEstCritique());
        dto.setStatutRaccordId(raccord.getStatutRaccord().getId());
        dto.setStatutRaccordNom(raccord.getStatutRaccord().getNomStatut());
        dto.setCreeLe(raccord.getCreeLe());

        if (raccord.getPersonnage() != null) {
            dto.setPersonnageId(raccord.getPersonnage().getId());
            dto.setPersonnageNom(raccord.getPersonnage().getNom());
        }
        
        if (raccord.getComedien() != null) {
            dto.setComedienId(raccord.getComedien().getId());
            dto.setComedienNom(raccord.getComedien().getNom());
        }
        
        // Convertir les images
        List<RaccordImageDTO> imagesDTO = raccord.getImages().stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
        dto.setImages(imagesDTO);
        
        return dto;
    }
    
    private RaccordImageDTO convertImageToDTO(RaccordImage image) {
        RaccordImageDTO dto = new RaccordImageDTO();
        dto.setId(image.getId());
        dto.setNomFichier(image.getNomFichier());
        dto.setCheminFichier(image.getCheminFichier());
        dto.setDescriptionImage(image.getDescriptionImage());
        dto.setEstImageReference(image.getEstImageReference());
        dto.setCreeLe(image.getCreeLe());
        
        // Ajouter l'ID du type de raccord pour le filtrage
        if (image.getRaccord() != null && image.getRaccord().getTypeRaccord() != null) {
            dto.setTypeRaccordId(image.getRaccord().getTypeRaccord().getId());
        }
        
        return dto;
    }
    
    private SceneDTO convertSceneToDTO(Scene scene) {
        SceneDTO dto = new SceneDTO();
        dto.setIdScene(scene.getId()); // Utiliser setId() qui va définir idScene
        dto.setTitre(scene.getTitre());
        dto.setOrdre(scene.getOrdre());
        dto.setSynopsis(scene.getSynopsis());
        
        // Récupérer le statut via SceneStatutRepository comme dans votre SceneService
        Optional<SceneStatut> statutOpt = sceneStatutRepository.findLatestStatutBySceneId(scene.getId());
        if (statutOpt.isPresent()) {
            SceneStatut statut = statutOpt.get();
            dto.setStatutNom(statut.getStatut().getNomStatutsScene()); // Utiliser getNomStatutsScene()
        } else {
            dto.setStatutNom("Non défini");
        }
        
        // Récupérer les informations de la séquence
        if (scene.getSequence() != null) {
            dto.setSequenceId(scene.getSequence().getId());
            dto.setSequenceTitre(scene.getSequence().getTitre());
        }
        
        return dto;
    }


}