-- Créer un rôle
INSERT INTO roles (name) VALUES ('admin'), ('editor'), ('viewer');

-- Créer des permissions
INSERT INTO permissions (name) VALUES ('read_reports'), ('edit_users'), ('delete_data');

-- Lier les permissions au rôle 'admin'
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Associer un rôle à un utilisateur
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1); -- user 1 devient admin
