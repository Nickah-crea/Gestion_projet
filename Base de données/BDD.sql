CREATE DATABASE gestion_projet_film;

\c gestion_projet_film;

CREATE TABLE utilisateurs (
    id_utilisateur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO utilisateurs (nom, email, mot_de_passe, role, cree_le, modifie_le) VALUES
('Admin Principal', 'admin@gmail.com', '$2b$10$5uPtvRMSmI0joRW8eGIh7uIei5gBZGyYA6DujMnqrE7xkXV1jH6dm', 'ADMIN', '2025-01-01 09:00:00', '2025-01-01 09:00:00'),
('Jean Dupont', 'jean.dupont@gmail.com', '$2b$10$izG.kO9u6U8vn5GplBMbT.0xGB5nvz2UaXxqUhjfpmJlFeM0EJDe.', 'REALISATEUR', '2025-01-02 10:15:00', '2025-01-02 10:15:00'),
('Sophie Martin', 'sophie.martin@gmail.com', '$2b$10$vZ7e1Q8FTPGK2fE0vc9nROGwspASGCWXqtB7sbFA9GAUuB/bgKQQG', 'REALISATEUR', '2025-01-03 14:30:00', '2025-01-03 14:30:00'),
('Marc Leroy', 'marc.leroy@gmail.com', '$2b$10$anTjad98OwaB86wuBZ9l9u4PHjagRFN8mNjMqxlAWKGZhcfDrD151', 'SCENARISTE', '2025-01-04 11:45:00', '2025-01-04 11:45:00'),
('Alice Dubois', 'alice.dubois@gmail.com', '$2b$10$gFJWNt6oW8d7xZ79VaOxQew4M.H3ojVdhtqRZJ5RNotsgAG7oXn6e', 'SCENARISTE', '2025-01-05 16:20:00', '2025-01-05 16:20:00');


CREATE TABLE scenaristes (
    id_scenariste BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    specialite VARCHAR(100),
    biographie TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO scenaristes (id_utilisateur, specialite, biographie)
SELECT 
    id_utilisateur,
    CASE 
        WHEN nom LIKE '%Leroy%' THEN 'Documentaire'
        WHEN nom LIKE '%Dubois%' THEN 'Animation et Jeunesse'
        ELSE 'Général'
    END as specialite,
    'Scenariste experimente' as biographie
FROM utilisateurs 
WHERE role = 'SCENARISTE';


CREATE TABLE realisateurs (
    id_realisateur BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    specialite VARCHAR(100),
    biographie TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO realisateurs (id_utilisateur, specialite, biographie)
SELECT 
    id_utilisateur,
    CASE 
        WHEN nom LIKE '%Dupont%' THEN 'Thriller et Drame'
        WHEN nom LIKE '%Martin%' THEN 'Romance et Comédie'
        ELSE 'Général'
    END as specialite,
    'Realisateur experimente' as biographie
FROM utilisateurs 
WHERE role = 'REALISATEUR';


CREATE TABLE genres (
    id_genre BIGSERIAL PRIMARY KEY,
    nom_genre VARCHAR(50) NOT NULL,
    description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO genres (nom_genre, description, cree_le) VALUES
('Long metrage', 'Film de plus de 60 minutes', '2025-01-01 09:05:00'),
('Court metrage', 'Film de moins de 60 minutes', '2025-01-01 09:10:00'),
('Documentaire', 'Film à vocation informative ou educative', '2025-01-01 09:15:00'),
('Animation', 'Film utilisant des techniques danimation', '2025-01-01 09:20:00'),
('Serie', 'Production audiovisuelle en plusieurs episodes', '2025-01-01 09:25:00'),
('Clip musical', 'Vidéo accompagnant une chanson', '2025-01-01 09:30:00'),
('Film expérimental', 'Œuvre cinématographique explorant de nouvelles formes narratives ou visuelles', '2025-01-01 09:35:00');


CREATE TABLE statuts_projet (
    id_statut_projet BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statuts_projet VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);




INSERT INTO statuts_projet (code, nom_statuts_projet, description, ordre_affichage) VALUES
('en_cours', 'En cours', 'Projet en cours', 1),
('fini', 'Fini', 'Projet terminé', 2),
('annule', 'Annulé', 'Projet abandonné', 3),
('en_pause', 'En pause', 'Projet en pause', 4);

UPDATE statuts_projet SET 
    nom_statuts_projet = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_statuts_projet, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');


CREATE TABLE projets (
    id_projet BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    synopsis TEXT,
    id_genre BIGINT REFERENCES genres(id_genre),
    date_debut DATE,
    date_fin DATE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Association scénaristes et projets
CREATE TABLE projet_scenaristes (
    id_projet_scenariste BIGSERIAL PRIMARY KEY,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    id_scenariste BIGINT REFERENCES scenaristes(id_scenariste) ON DELETE CASCADE,
    role_scenariste VARCHAR(100) NOT NULL, 
    pourcentage_contribution INTEGER DEFAULT 100,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_projet, id_scenariste)
);


CREATE INDEX idx_scenaristes_utilisateur ON scenaristes(id_utilisateur);
CREATE INDEX idx_projet_scenaristes_projet ON projet_scenaristes(id_projet);
CREATE INDEX idx_projet_scenaristes_scenariste ON projet_scenaristes(id_scenariste);

-- Association Projet et Statut
CREATE TABLE projet_statuts (
    id_projet_statut BIGSERIAL PRIMARY KEY,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    id_statut BIGINT REFERENCES statuts_projet(id_statut_projet) ON DELETE RESTRICT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP

);


CREATE TABLE statuts_episode (
    id_statut_episode BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statuts_episode VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

INSERT INTO statuts_episode (code, nom_statuts_episode, description, ordre_affichage) VALUES
('planifie', 'Planifié', 'Episode planifié', 1),
('preparation', 'En préparation', 'Préparation technique', 2),
('tournage', 'En tournage', 'Tournage en cours', 3),
('tourne', 'Tourné', 'Tournage terminé', 4),
('monte', 'Monté', 'Montage terminé', 5),
('valide', 'Validé', 'Episode validé', 6);

UPDATE statuts_episode SET 
    nom_statuts_episode = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_statuts_episode, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');



CREATE TABLE episodes (
    id_episode BIGSERIAL PRIMARY KEY,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    ordre INTEGER NOT NULL,
    synopsis TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);

ALTER TABLE episodes ADD CONSTRAINT unique_ordre_per_projet UNIQUE (id_projet, ordre);


CREATE TABLE episode_statuts (
    id_episode_statut BIGSERIAL PRIMARY KEY,
    id_episode BIGINT REFERENCES episodes(id_episode) ON DELETE CASCADE,
    id_statut BIGINT REFERENCES statuts_episode(id_statut_episode) ON DELETE RESTRICT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);


-- Table pour lier les réalisateurs aux épisodes
CREATE TABLE episode_realisateurs (
    id_episode_realisateur BIGSERIAL PRIMARY KEY,
    id_episode BIGINT REFERENCES episodes(id_episode) ON DELETE CASCADE,
    id_realisateur BIGINT REFERENCES realisateurs(id_realisateur) ON DELETE CASCADE,
    role_realisateur VARCHAR(100) NOT NULL DEFAULT 'Realisateur principal',
    pourcentage_contribution INTEGER DEFAULT 100,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_episode, id_realisateur)
);

-- Table pour lier les scénaristes aux épisodes (au lieu des projets)
CREATE TABLE episode_scenaristes (
    id_episode_scenariste BIGSERIAL PRIMARY KEY,
    id_episode BIGINT REFERENCES episodes(id_episode) ON DELETE CASCADE,
    id_scenariste BIGINT REFERENCES scenaristes(id_scenariste) ON DELETE CASCADE,
    role_scenariste VARCHAR(100) NOT NULL,
    pourcentage_contribution INTEGER DEFAULT 100,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_episode, id_scenariste)
);


CREATE INDEX idx_episode_realisateurs_episode ON episode_realisateurs(id_episode);
CREATE INDEX idx_episode_realisateurs_realisateur ON episode_realisateurs(id_realisateur);
CREATE INDEX idx_episode_scenaristes_episode ON episode_scenaristes(id_episode);
CREATE INDEX idx_episode_scenaristes_scenariste ON episode_scenaristes(id_scenariste);


-- Vue pour voir tous les épisodes avec leurs réalisateurs et scénaristes
CREATE VIEW v_episode_equipe AS
SELECT 
    e.id_episode,
    e.titre as titre_episode,
    p.titre as titre_projet,
    r.id_realisateur,
    u_r.nom as nom_realisateur,
    u_r.email as email_realisateur,
    s.id_scenariste,
    u_s.nom as nom_scenariste,
    u_s.email as email_scenariste
FROM episodes e
LEFT JOIN projets p ON e.id_projet = p.id_projet
LEFT JOIN episode_realisateurs er ON e.id_episode = er.id_episode
LEFT JOIN realisateurs r ON er.id_realisateur = r.id_realisateur
LEFT JOIN utilisateurs u_r ON r.id_utilisateur = u_r.id_utilisateur
LEFT JOIN episode_scenaristes es ON e.id_episode = es.id_episode
LEFT JOIN scenaristes s ON es.id_scenariste = s.id_scenariste
LEFT JOIN utilisateurs u_s ON s.id_utilisateur = u_s.id_utilisateur;


CREATE OR REPLACE VIEW v_episodes_par_utilisateur AS
SELECT 
    u.id_utilisateur,
    u.nom,
    u.email,
    u.role,
    e.id_episode,
    e.titre as titre_episode,
    p.titre as titre_projet
FROM utilisateurs u
LEFT JOIN realisateurs r ON u.id_utilisateur = r.id_utilisateur
LEFT JOIN episode_realisateurs er ON r.id_realisateur = er.id_realisateur  -- CORRECTION ici
LEFT JOIN episodes e ON er.id_episode = e.id_episode
LEFT JOIN projets p ON e.id_projet = p.id_projet
WHERE u.role = 'REALISATEUR'

UNION

SELECT 
    u.id_utilisateur,
    u.nom,
    u.email,
    u.role,
    e.id_episode,
    e.titre as titre_episode,
    p.titre as titre_projet
FROM utilisateurs u
LEFT JOIN scenaristes s ON u.id_utilisateur = s.id_utilisateur
LEFT JOIN episode_scenaristes es ON s.id_scenariste = es.id_scenariste
LEFT JOIN episodes e ON es.id_episode = e.id_episode
LEFT JOIN projets p ON e.id_projet = p.id_projet
WHERE u.role = 'SCENARISTE';

CREATE TABLE statuts_sequence (
    id_statut_sequence BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statuts_sequence VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

INSERT INTO statuts_sequence (code, nom_statuts_sequence, description, ordre_affichage) VALUES
('a_planifier', 'À planifier', 'Séquence à organiser', 1),
('planifiee', 'Planifiée', 'Séquence planifiée', 2),
('prete', 'Prête', 'Préparée pour tournage', 3),
('tournage', 'En tournage', 'Tournage en cours', 4),
('tournee', 'Tournée', 'Tournage terminé', 5),
('montee', 'Montée', 'Montage terminé', 6);

UPDATE statuts_sequence SET 
    nom_statuts_sequence = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_statuts_sequence, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');



CREATE TABLE sequences (
    id_sequence BIGSERIAL PRIMARY KEY,
    id_episode BIGINT REFERENCES episodes(id_episode) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    ordre INTEGER NOT NULL,
    synopsis TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE sequences ADD CONSTRAINT unique_ordre_per_episode UNIQUE (id_episode, ordre);



CREATE TABLE sequence_statuts (
    id_sequence_statut BIGSERIAL PRIMARY KEY,
    id_sequence BIGINT REFERENCES sequences(id_sequence) ON DELETE CASCADE,
    id_statut BIGINT REFERENCES statuts_sequence(id_statut_sequence) ON DELETE RESTRICT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);


CREATE TABLE statuts_scene (
    id_statut_scene BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statuts_scene VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

INSERT INTO statuts_scene (code, nom_statuts_scene, description, ordre_affichage) VALUES
('ecrite', 'Ecrite', 'Scène écrite', 1),
('preparee', 'Préparée', 'Decors et accessoires prêts', 2),
('planifiee', 'Planifiée', 'Plan de tournage établi', 3),
('tournage', 'En tournage', 'Tournage en cours', 4),
('tournee', 'Tournee', 'Tournage terminé', 5),
('a_retourner', 'A retourner', 'Nécessite des reshoots', 6),
('validee', 'Validée', 'Scène approuvée', 7);

UPDATE statuts_scene SET 
    nom_statuts_scene = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_statuts_scene, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');



CREATE TABLE scenes (
    id_scene BIGSERIAL PRIMARY KEY,
    id_sequence BIGINT REFERENCES sequences(id_sequence) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    ordre INTEGER NOT NULL,
    synopsis TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE scenes ADD CONSTRAINT unique_ordre_per_sequence UNIQUE (id_sequence, ordre);


CREATE TABLE scene_statuts (
    id_scene_statut BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_statut BIGINT REFERENCES statuts_scene(id_statut_scene) ON DELETE RESTRICT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);

CREATE TABLE comediens (
    id_comedien BIGSERIAL PRIMARY KEY,
    nom_comedien VARCHAR(255) NOT NULL,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    age INTEGER,
    email VARCHAR(255),
    photo VARCHAR(255),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE disponibilites_comediens (
    id_disponibilite_comedien BIGSERIAL PRIMARY KEY,
    id_comedien BIGINT REFERENCES comediens(id_comedien) ON DELETE CASCADE,
    date DATE NOT NULL,
    statut VARCHAR(50) NOT NULL
);

CREATE TABLE comedien_scene (
    id_comedien_scene BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_comedien BIGINT REFERENCES comediens(id_comedien) ON DELETE RESTRICT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE comedien_scene 
ADD UNIQUE (id_scene, id_comedien);


CREATE TABLE personnages (
    id_personnage BIGSERIAL PRIMARY KEY,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    id_comedien BIGINT REFERENCES comediens(id_comedien) ON DELETE SET NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE dialogues (
    id_dialogue BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_personnage BIGINT REFERENCES personnages(id_personnage) ON DELETE SET NULL,
    texte TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    observation TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dialogues ADD CONSTRAINT unique_ordre_per_scene UNIQUE (id_scene, ordre);


/*ALTER TABLE dialogues 
ADD COLUMN couleur_texte VARCHAR(7) DEFAULT '#000000',
ADD COLUMN couleur_observation VARCHAR(7) DEFAULT '#666666'; */

CREATE TABLE couleurs (
    id_couleur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    valeur_hex VARCHAR(7) NOT NULL,
    est_defaut BOOLEAN DEFAULT FALSE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO couleurs (nom, valeur_hex, est_defaut) VALUES
('Noir', '#000000', TRUE),
('Gris', '#666666', TRUE),
('Golden Yellow', '#FFDD00', FALSE),
('Key Blue', '#C8F6FF', FALSE),
('Celery', '#E0F79C', FALSE),
('Tomato', '#FF6344', FALSE),
('Dark Blue', '#2A3056', FALSE),
('Teal', '#43B0AF', FALSE),
('Light Cyan', '#67FFF2', FALSE),
('Dark Green', '#294933', FALSE),
('Medium Green', '#446B5C', FALSE),
('Light Green', '#81EC86', FALSE);

CREATE INDEX idx_couleurs_valeur_hex ON couleurs(valeur_hex);


CREATE TABLE lieux (
    id_lieu BIGSERIAL PRIMARY KEY,
    id_projet BIGINT REFERENCES projets(id_projet) ON DELETE CASCADE,
    nom_lieu VARCHAR(255) NOT NULL,
    type_lieu VARCHAR(50) NOT NULL, 
    adresse TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE plateaux (
    id_plateau BIGSERIAL PRIMARY KEY,
    id_lieu BIGINT REFERENCES lieux(id_lieu) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    type_plateau VARCHAR(50) NOT NULL,
    description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE scene_plateau (
    id_scene_plateau BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_plateau BIGINT REFERENCES plateaux(id_plateau) ON DELETE CASCADE,
    description_utilisation TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_scene, id_plateau)
);

CREATE TABLE scene_lieu (
    id_scene_lieu BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_lieu BIGINT REFERENCES lieux(id_lieu) ON DELETE CASCADE,
    id_plateau BIGINT REFERENCES plateaux(id_plateau) ON DELETE SET NULL,
    description_utilisation TEXT, 
    UNIQUE (id_scene, id_lieu)
);

CREATE TABLE commentaires (
    id_commentaire BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE episode_commentaires (
    id_episode_commentaire BIGSERIAL PRIMARY KEY,
    id_episode BIGINT REFERENCES episodes(id_episode) ON DELETE CASCADE,
    id_commentaire BIGINT REFERENCES commentaires(id_commentaire) ON DELETE CASCADE,
    UNIQUE(id_episode, id_commentaire)
);

CREATE TABLE sequence_commentaires (
    id_sequence_commentaire BIGSERIAL PRIMARY KEY,
    id_sequence BIGINT REFERENCES sequences(id_sequence) ON DELETE CASCADE,
    id_commentaire BIGINT REFERENCES commentaires(id_commentaire) ON DELETE CASCADE,
    UNIQUE(id_sequence, id_commentaire)
);


CREATE TABLE scene_commentaires (
    id_scene_commentaire BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_commentaire BIGINT REFERENCES commentaires(id_commentaire) ON DELETE CASCADE,
    UNIQUE(id_scene, id_commentaire)
);


CREATE TABLE dialogue_commentaires (
    id_dialogue_commentaire BIGSERIAL PRIMARY KEY,
    id_dialogue BIGINT REFERENCES dialogues(id_dialogue) ON DELETE CASCADE,
    id_commentaire BIGINT REFERENCES commentaires(id_commentaire) ON DELETE CASCADE,
    UNIQUE(id_dialogue, id_commentaire)
);

CREATE INDEX idx_commentaires_utilisateur ON commentaires(id_utilisateur);
CREATE INDEX idx_episode_commentaires_episode ON episode_commentaires(id_episode);
CREATE INDEX idx_sequence_commentaires_sequence ON sequence_commentaires(id_sequence);
CREATE INDEX idx_scene_commentaires_scene ON scene_commentaires(id_scene);
CREATE INDEX idx_dialogue_commentaires_dialogue ON dialogue_commentaires(id_dialogue);


CREATE TABLE dialogue_surlignages (
    id_dialogue_surlignages BIGSERIAL PRIMARY KEY,
    dialogue_id BIGINT NOT NULL,
    couleur_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    texte_surligne TEXT NOT NULL,
    debut_index INTEGER NOT NULL,
    fin_index INTEGER NOT NULL,
    cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dialogue FOREIGN KEY (dialogue_id) REFERENCES dialogues(id_dialogue),
    CONSTRAINT fk_couleur FOREIGN KEY (couleur_id) REFERENCES couleurs(id_couleur),
    CONSTRAINT fk_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id_utilisateur)
);

CREATE INDEX idx_dialogue_surlignage_dialogue_id ON dialogue_surlignages(dialogue_id);
CREATE INDEX idx_dialogue_surlignage_couleur_id ON dialogue_surlignages(couleur_id);
CREATE INDEX idx_dialogue_surlignage_utilisateur_id ON dialogue_surlignages(utilisateur_id);



CREATE VIEW v_episode_permissions AS
SELECT 
    e.id_episode,
    u.id_utilisateur,
    u.role,
    CASE 
        WHEN u.role = 'ADMIN' THEN TRUE
        WHEN u.role = 'REALISATEUR' AND er.id_episode_realisateur IS NOT NULL THEN TRUE
        WHEN u.role = 'SCENARISTE' AND es.id_episode_scenariste IS NOT NULL THEN TRUE
        ELSE FALSE
    END as has_access
FROM episodes e
CROSS JOIN utilisateurs u
LEFT JOIN episode_realisateurs er ON e.id_episode = er.id_episode 
    AND er.id_realisateur IN (SELECT id_realisateur FROM realisateurs WHERE id_utilisateur = u.id_utilisateur)
LEFT JOIN episode_scenaristes es ON e.id_episode = es.id_episode 
    AND es.id_scenariste IN (SELECT id_scenariste FROM scenaristes WHERE id_utilisateur = u.id_utilisateur)
WHERE u.role IN ('ADMIN', 'REALISATEUR', 'SCENARISTE');

-- Vue pour les permissions détaillées
CREATE VIEW v_user_episode_permissions AS
SELECT 
    ep.id_episode,
    u.id_utilisateur,
    u.nom,
    u.role,
    -- Permissions de base
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_scenaristes es 
                     JOIN scenaristes s ON es.id_scenariste = s.id_scenariste 
                     WHERE es.id_episode = ep.id_episode AND s.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_access_episode,
    
    -- Permissions d'édition
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_edit_episode,
    
    -- Permissions de création de séquences
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_scenaristes es 
                     JOIN scenaristes s ON es.id_scenariste = s.id_scenariste 
                     WHERE es.id_episode = ep.id_episode AND s.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_create_sequence,

    -- Permissions de création de scènes
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_scenaristes es 
                     JOIN scenaristes s ON es.id_scenariste = s.id_scenariste 
                     WHERE es.id_episode = ep.id_episode AND s.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_create_scene,

    -- Permissions de création de dialogues
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_scenaristes es 
                     JOIN scenaristes s ON es.id_scenariste = s.id_scenariste 
                     WHERE es.id_episode = ep.id_episode AND s.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_create_dialogue,

    -- Permissions de création de lieux/plateaux
    CASE WHEN u.role = 'ADMIN' THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_realisateurs er 
                     JOIN realisateurs r ON er.id_realisateur = r.id_realisateur 
                     WHERE er.id_episode = ep.id_episode AND r.id_utilisateur = u.id_utilisateur) THEN TRUE
         WHEN EXISTS (SELECT 1 FROM episode_scenaristes es 
                     JOIN scenaristes s ON es.id_scenariste = s.id_scenariste 
                     WHERE es.id_episode = ep.id_episode AND s.id_utilisateur = u.id_utilisateur) THEN TRUE
         ELSE FALSE
    END as can_create_lieu

FROM episodes ep
CROSS JOIN utilisateurs u
WHERE u.role IN ('ADMIN', 'REALISATEUR', 'SCENARISTE');






-- Table des statuts de planning
CREATE TABLE statuts_planning (
    id_statut_planning BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statut VARCHAR(100) NOT NULL,
    description TEXT,
    ordre_affichage INTEGER NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE
);

INSERT INTO statuts_planning (code, nom_statut, description, ordre_affichage) VALUES
('planifie', 'Planifier', 'Tournage planifier', 1),
('confirme', 'Confirmer', 'Tournage confirmer', 2),
('en_cours', 'En cours', 'Tournage en cours', 3),
('termine', 'Terminer', 'Tournage terminer', 4),
('reporte', 'Reporter', 'Tournage reporter', 5),
('annule', 'Annuler', 'Tournage annuler', 6);


-- Table du planning de tournage
CREATE TABLE planning_tournage (
    id_planning_tournage BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    date_tournage DATE NOT NULL,
    heure_debut VARCHAR(10),
    heure_fin VARCHAR(10),
    id_statut_planning BIGINT REFERENCES statuts_planning(id_statut_planning),
    description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Ajouter les colonnes pour les clés étrangères
ALTER TABLE planning_tournage 
ADD COLUMN id_lieu BIGINT REFERENCES lieux(id_lieu) ON DELETE SET NULL,
ADD COLUMN id_plateau BIGINT REFERENCES plateaux(id_plateau) ON DELETE SET NULL;

-- Optionnel: Créer des index pour améliorer les performances
CREATE INDEX idx_planning_tournage_lieu ON planning_tournage(id_lieu);
CREATE INDEX idx_planning_tournage_plateau ON planning_tournage(id_plateau);


CREATE INDEX idx_planning_tournage_date ON planning_tournage(date_tournage);
CREATE INDEX idx_planning_tournage_scene ON planning_tournage(id_scene);
CREATE INDEX idx_planning_tournage_statut ON planning_tournage(id_statut_planning);


CREATE VIEW v_planning_global AS
SELECT 
    pt.date_tournage,
    pt.heure_debut,
    pt.heure_fin,
    s.titre as scene_titre,
    seq.titre as sequence_titre,
    e.titre as episode_titre,
    p.titre as projet_titre,
    sp.nom_statut,
    pt.lieu_tournage,
    l.nom_lieu,
    pl.nom as nom_plateau
FROM planning_tournage pt
JOIN scenes s ON pt.id_scene = s.id_scene
JOIN sequences seq ON s.id_sequence = seq.id_sequence  -- Lien via sequences
JOIN episodes e ON seq.id_episode = e.id_episode       -- Puis vers episodes
JOIN projets p ON e.id_projet = p.id_projet
JOIN statuts_planning sp ON pt.id_statut_planning = sp.id_statut_planning
LEFT JOIN lieux l ON pt.id_lieu = l.id_lieu
LEFT JOIN plateaux pl ON pt.id_plateau = pl.id_plateau
ORDER BY pt.date_tournage, pt.heure_debut;



CREATE VIEW v_planning_par_projet AS
SELECT 
    p.id_projet,
    p.titre as projet_titre,
    pt.date_tournage,
    COUNT(pt.id_planning_tournage) as nb_scenes_planifiees,
    SUM(CASE WHEN sp.code = 'termine' THEN 1 ELSE 0 END) as nb_scenes_terminees
FROM projets p
JOIN episodes e ON p.id_projet = e.id_projet
JOIN sequences seq ON e.id_episode = seq.id_episode
JOIN scenes s ON seq.id_sequence = s.id_sequence
LEFT JOIN planning_tournage pt ON s.id_scene = pt.id_scene
LEFT JOIN statuts_planning sp ON pt.id_statut_planning = sp.id_statut_planning
GROUP BY p.id_projet, p.titre, pt.date_tournage
ORDER BY p.titre, pt.date_tournage;


CREATE VIEW v_disponibilites_comediens AS
SELECT 
    c.nom_comedien,
    p.titre as projet_titre,
    dc.date,
    dc.statut,
    s.titre as scene_planifiee
FROM comediens c
JOIN projets p ON c.id_projet = p.id_projet
LEFT JOIN disponibilites_comediens dc ON c.id_comedien = dc.id_comedien
LEFT JOIN comedien_scene cs ON c.id_comedien = cs.id_comedien
LEFT JOIN scenes s ON cs.id_scene = s.id_scene
LEFT JOIN planning_tournage pt ON s.id_scene = pt.id_scene
ORDER BY c.nom_comedien, dc.date;


-- Ajout de données de test pour le planning
INSERT INTO planning_tournage (id_scene, date_tournage, heure_debut, heure_fin, id_statut_planning, id_lieu, id_plateau, description) VALUES
(1, '2024-03-20', '09:00', '12:00', 1, 1, 1, 'Tournage scène d''ouverture'),
(2, '2024-03-20', '14:00', '17:00', 1, 2, 2, 'Tournage scène dialogue'),
(3, '2024-03-21', '10:00', '13:00', 2, 1, 1, 'Tournage scène extérieure confirmé');

-- Vue améliorée pour le planning
CREATE OR REPLACE VIEW v_planning_complet AS
SELECT 
    pt.id_planning_tournage,
    pt.date_tournage,
    pt.heure_debut,
    pt.heure_fin,
    s.id_scene,
    s.titre as scene_titre,
    s.ordre as scene_ordre,
    seq.id_sequence,
    seq.titre as sequence_titre,
    seq.ordre as sequence_ordre,
    e.id_episode,
    e.titre as episode_titre,
    e.ordre as episode_ordre,
    p.id_projet,
    p.titre as projet_titre,
    sp.id_statut_planning,
    sp.code as statut_code,
    sp.nom_statut,
    sp.description as statut_description,
    l.id_lieu,
    l.nom_lieu,
    l.type_lieu,
    l.adresse,
    pl.id_plateau,
    pl.nom as plateau_nom,
    pl.type_plateau,
    pl.description as plateau_description,
    pt.description as notes_tournage,
    pt.cree_le,
    pt.modifie_le,
    -- Informations sur les comédiens de la scène
    (SELECT COUNT(*) FROM comedien_scene cs WHERE cs.id_scene = s.id_scene) as nb_comediens,
    (SELECT string_agg(c.nom_comedien, ', ') 
     FROM comedien_scene cs 
     JOIN comediens c ON cs.id_comedien = c.id_comedien 
     WHERE cs.id_scene = s.id_scene) as noms_comediens
FROM planning_tournage pt
JOIN scenes s ON pt.id_scene = s.id_scene
JOIN sequences seq ON s.id_sequence = seq.id_sequence
JOIN episodes e ON seq.id_episode = e.id_episode
JOIN projets p ON e.id_projet = p.id_projet
JOIN statuts_planning sp ON pt.id_statut_planning = sp.id_statut_planning
LEFT JOIN lieux l ON pt.id_lieu = l.id_lieu
LEFT JOIN plateaux pl ON pt.id_plateau = pl.id_plateau
ORDER BY pt.date_tournage, pt.heure_debut;



-- Table pour gérer les tournages de scènes
CREATE TABLE scene_tournage (
    id_scene_tournage BIGSERIAL PRIMARY KEY,
    id_scene BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    date_tournage DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    id_lieu BIGINT REFERENCES lieux(id_lieu),
    id_plateau BIGINT REFERENCES plateaux(id_plateau),
    statut_tournage VARCHAR(50) DEFAULT 'planifie',
    notes TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_scene) -- Une scène ne peut être planifiée qu'une fois
);

-- Index pour optimiser les recherches
CREATE INDEX idx_scene_tournage_date ON scene_tournage(date_tournage);
CREATE INDEX idx_scene_tournage_statut ON scene_tournage(statut_tournage);
CREATE INDEX idx_scene_tournage_lieu ON scene_tournage(id_lieu);
CREATE INDEX idx_scene_tournage_plateau ON scene_tournage(id_plateau);





-- Table pour les statuts de raccord (doit être créée avant raccords)
CREATE TABLE statuts_raccord (
    id_statut_raccord BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_statut VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO statuts_raccord (code, nom_statut, description) VALUES
('A_VERIFIER', 'À vérifier', 'Raccord à vérifier'),
('VALIDE', 'Validé', 'Raccord validé'),
('NON_CONFORME', 'Non conforme', 'Raccord non conforme'),
('CORRIGE', 'Corrigé', 'Raccord corrigé');


UPDATE statuts_raccord SET 
    nom_statut = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_statut, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');

-- -- Table pour les statuts de vérification (doit être créée avant verification_raccords)
-- CREATE TABLE statuts_verification (
--     id_statut_verification BIGSERIAL PRIMARY KEY,
--     code VARCHAR(50) UNIQUE NOT NULL,
--     nom_statut VARCHAR(100) NOT NULL,
--     description TEXT,
--     ordre_affichage INTEGER DEFAULT 1,
--     est_actif BOOLEAN DEFAULT TRUE,
--     cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO statuts_verification (code, nom_statut, description, ordre_affichage) VALUES
-- ('CONFORME', 'Conforme', 'Le raccord est conforme', 1),
-- ('NON_CONFORME', 'Non conforme', 'Le raccord présente des incohérences', 2),
-- ('A_CORRIGER', 'À corriger', 'Le raccord nécessite des corrections', 3);

CREATE TABLE types_raccord (
    id_type_raccord BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom_type VARCHAR(100) NOT NULL,
    description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO types_raccord (code, nom_type, description) VALUES
('decor', 'Décor', 'Raccord de décor et environnement'),
('costume', 'Costume', 'Raccord de vêtements et accessoires vestimentaires'),
('accessoire', 'Accessoire', 'Raccord d''objets et accessoires'),
('coiffure', 'Coiffure', 'Raccord de coiffure et maquillage'),
('lumière', 'Lumière', 'Raccord d''éclairage et ambiance lumineuse'),
('position', 'Position', 'Raccord de position des acteurs et objets');

UPDATE types_raccord SET 
    nom_type = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nom_type, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A'),
    description = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(description, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'à', 'a'), 'À', 'A');



-- Table principale des raccords
CREATE TABLE raccords (
    id_raccord BIGSERIAL PRIMARY KEY,
    scene_source_id BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    scene_cible_id BIGINT REFERENCES scenes(id_scene) ON DELETE CASCADE,
    id_type_raccord BIGINT REFERENCES types_raccord(id_type_raccord),
    description TEXT NOT NULL,
    est_critique BOOLEAN DEFAULT FALSE,
    id_statut_raccord BIGINT REFERENCES statuts_raccord(id_statut_raccord),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_personnage BIGINT REFERENCES personnages(id_personnage),
    id_comedien BIGINT REFERENCES comediens(id_comedien)
);

ALTER TABLE raccords 
ADD COLUMN date_creation_raccord TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN est_raccord_replanification BOOLEAN DEFAULT FALSE,
ADD COLUMN tournage_source_id BIGINT REFERENCES scene_tournage(id_scene_tournage),
ADD COLUMN est_actif BOOLEAN DEFAULT TRUE;

-- CREATE TABLE raccord_types_photos (
--   id_raccord_type_photo BIGSERIAL PRIMARY KEY,
--   id_raccord BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
--   id_type_raccord BIGINT REFERENCES types_raccord(id_type_raccord),
--   cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE(id_raccord, id_type_raccord)
-- ); Pas besoin pour l'instant


CREATE TABLE replanification (
    id BIGSERIAL PRIMARY KEY,
    raccord_id BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
    nouvelle_date DATE NOT NULL,
    raison TEXT,
    statut VARCHAR(50) DEFAULT 'PLANIFIEE',
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scene_id BIGINT REFERENCES scenes(id_scene),
    raccord_ids TEXT
);

ALTER TABLE replanification 
ADD COLUMN nouvelle_heure_debut TIME,
ADD COLUMN nouvelle_heure_fin TIME;

-- Table de liaison entre raccords et planning de tournage
CREATE TABLE raccord_planning (
    id_raccord_planning BIGSERIAL PRIMARY KEY,
    id_raccord BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
    id_planning_tournage BIGINT REFERENCES planning_tournage(id_planning_tournage) ON DELETE CASCADE,
    type_liaison VARCHAR(50) NOT NULL, -- 'SOURCE' ou 'CIBLE'
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_raccord, id_planning_tournage, type_liaison)
);

CREATE INDEX idx_raccord_planning_raccord ON raccord_planning(id_raccord);
CREATE INDEX idx_raccord_planning_planning ON raccord_planning(id_planning_tournage);



-- -- Contrainte pour empêcher les doublons scène-source = scène-cible
-- ALTER TABLE raccords ADD CONSTRAINT unique_raccord_different_scenes 
-- CHECK (scene_source_id != scene_cible_id OR id_type_raccord IS NULL);

-- Table pour stocker les images de référence des raccords
CREATE TABLE raccord_images (
    id_raccord_image BIGSERIAL PRIMARY KEY,
    id_raccord BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    description_image TEXT,
    est_image_reference BOOLEAN DEFAULT FALSE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE raccord_images_partages (
    id_raccord_image_partage BIGSERIAL PRIMARY KEY,
    id_raccord BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
    id_raccord_image BIGINT REFERENCES raccord_images(id_raccord_image) ON DELETE CASCADE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_raccord, id_raccord_image)
);

-- -- Table pour suivre la vérification des raccords pendant le tournage
-- CREATE TABLE verification_raccords (
--     id_verification BIGSERIAL PRIMARY KEY,
--     id_raccord BIGINT REFERENCES raccords(id_raccord) ON DELETE CASCADE,
--     id_utilisateur BIGINT REFERENCES utilisateurs(id_utilisateur),
--     date_verification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     id_statut_verification BIGINT REFERENCES statuts_verification(id_statut_verification),
--     notes_verification TEXT,
--     preuve_image VARCHAR(500)
-- );

-- Index pour optimiser les performances
CREATE INDEX idx_raccords_scene_source ON raccords(scene_source_id);
CREATE INDEX idx_raccords_scene_cible ON raccords(scene_cible_id);
CREATE INDEX idx_raccords_type ON raccords(id_type_raccord);
CREATE INDEX idx_raccord_images_raccord ON raccord_images(id_raccord);
CREATE INDEX idx_verification_raccord ON verification_raccords(id_raccord);

ALTER TABLE raccords DROP CONSTRAINT IF EXISTS unique_raccord_different_scenes;



-- Vue pour les alertes de raccords
CREATE OR REPLACE VIEW v_alertes_raccords AS
SELECT 
    r.id_raccord,
    r.description,
    r.est_critique,
    sr.nom_statut as statut_raccord,
    tr.nom_type as type_raccord,
    ss.titre as scene_source_titre,
    sc.titre as scene_cible_titre,
    st_src.date_tournage as date_tournage_source,
    st_cible.date_tournage as date_tournage_cible,
    p.nom as personnage_nom,
    c.nom_comedien as comedien_nom
FROM raccords r
LEFT JOIN statuts_raccord sr ON r.id_statut_raccord = sr.id_statut_raccord
LEFT JOIN types_raccord tr ON r.id_type_raccord = tr.id_type_raccord
LEFT JOIN scenes ss ON r.scene_source_id = ss.id_scene
LEFT JOIN scenes sc ON r.scene_cible_id = sc.id_scene
LEFT JOIN scene_tournage st_src ON ss.id_scene = st_src.id_scene
LEFT JOIN scene_tournage st_cible ON sc.id_scene = st_cible.id_scene
LEFT JOIN personnages p ON r.id_personnage = p.id_personnage
LEFT JOIN comediens c ON r.id_comedien = c.id_comedien
WHERE r.est_critique = true 
   OR sr.code = 'A_VERIFIER';



-- Vue pour les alertes de raccords critiques avec dates de tournage
CREATE OR REPLACE VIEW v_raccords_critiques_calendrier AS
SELECT 
    r.id_raccord,
    r.description,
    tr.nom_type as type_raccord,
    r.est_critique,
    ss.titre as scene_source_titre,
    sc.titre as scene_cible_titre,
    st_src.date_tournage as date_tournage_source,
    st_cible.date_tournage as date_tournage_cible,
    -- Déterminer la date d'alerte (priorité à la date cible)
    COALESCE(st_cible.date_tournage, st_src.date_tournage) as date_alerte,
    -- Messages d'alerte simulés (à adapter avec votre logique métier)
    ARRAY[
        CASE 
            WHEN st_src.date_tournage IS NOT NULL AND st_cible.date_tournage IS NULL 
            THEN 'Scène source tournée mais scène cible non planifiée'
            WHEN st_src.date_tournage IS NOT NULL AND st_cible.date_tournage IS NOT NULL 
                 AND st_cible.date_tournage < st_src.date_tournage 
            THEN 'Incohérence chronologique: scène cible avant scène source'
            ELSE 'Raccord critique nécessite attention'
        END
    ] as messages_alerte
    
FROM raccords r
JOIN types_raccord tr ON r.id_type_raccord = tr.id_type_raccord
JOIN scenes ss ON r.scene_source_id = ss.id_scene
JOIN scenes sc ON r.scene_cible_id = sc.id_scene
LEFT JOIN scene_tournage st_src ON ss.id_scene = st_src.id_scene
LEFT JOIN scene_tournage st_cible ON sc.id_scene = st_cible.id_scene
WHERE r.est_critique = true
   AND (st_src.date_tournage IS NOT NULL OR st_cible.date_tournage IS NOT NULL);




CREATE TABLE historique_planning (
    id_historique BIGSERIAL PRIMARY KEY,
    id_scene BIGINT NOT NULL,
    type_planning VARCHAR(50) NOT NULL,
    ancienne_date DATE,
    ancienne_heure_debut VARCHAR(10),
    ancienne_heure_fin VARCHAR(10),
    ancien_statut VARCHAR(50),
    ancien_lieu_id BIGINT,
    ancien_plateau_id BIGINT,
    raison_replanification TEXT,
    date_replanification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_replanification BIGINT REFERENCES replanification(id) ON DELETE SET NULL
);


-- Index pour optimiser les recherches
CREATE INDEX idx_historique_scene ON historique_planning(id_scene);
CREATE INDEX idx_historique_date ON historique_planning(date_replanification);

-- Commentaires sur la table
COMMENT ON TABLE historique_planning IS 'Historique des replanifications de tournage';
COMMENT ON COLUMN historique_planning.type_planning IS 'Type de planning: SCENE_TOURNAGE ou PLANNING_TOURNAGE';
COMMENT ON COLUMN historique_planning.raison_replanification IS 'Raison de la replanification';
