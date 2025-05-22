-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Table de liaison roles <-> permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Insérer les permissions de base
INSERT INTO permissions (name) VALUES 
  ('read'),
  ('write'),
  ('edit')
ON CONFLICT (name) DO NOTHING;

-- Insérer les rôles
INSERT INTO roles (name) VALUES 
  ('user'),
  ('admin'),
  ('pc_admin'),
  ('candidat_admin'),
  ('atco_admin'),
  ('pc'),
  ('candidat'),
  ('atco')
ON CONFLICT (name) DO NOTHING;

-- Associer les rôles aux permissions
-- ADMIN: read, write, edit
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name IN ('read', 'write', 'edit');

-- PC_ADMIN: read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'pc_admin' AND p.name IN ('read', 'write');

-- CANDIDAT_ADMIN: read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'candidat_admin' AND p.name IN ('read', 'write');

-- ATCO_ADMIN: read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'atco_admin' AND p.name IN ('read', 'write');

-- PC: read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'pc' AND p.name = 'read';

-- CANDIDAT: read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'candidat' AND p.name = 'read';

-- ATCO: read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'atco' AND p.name = 'read';
