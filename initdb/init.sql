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

-- Table de liaison roles <-> permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Permissions
INSERT INTO permissions (name) VALUES 
  ('read'),
  ('write'),
  ('edit')
ON CONFLICT (name) DO NOTHING;

-- Rôles
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

-- Associations rôle → permission
-- admin : read, write, edit
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name IN ('read', 'write', 'edit');

-- pc_admin : read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'pc_admin' AND p.name IN ('read', 'write');

-- candidat_admin : read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'candidat_admin' AND p.name IN ('read', 'write');

-- atco_admin : read, write
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'atco_admin' AND p.name IN ('read', 'write');

-- pc : read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'pc' AND p.name = 'read';

-- candidat : read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'candidat' AND p.name = 'read';

-- atco : read
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'atco' AND p.name = 'read';
