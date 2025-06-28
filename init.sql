-- init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL,
    zone_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_department
        FOREIGN KEY(department_id)
        REFERENCES departments(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_zone
        FOREIGN KEY(zone_id)
        REFERENCES zones(id)
        ON DELETE RESTRICT,
    UNIQUE(name, department_id) -- No two cities with the same name in the same department
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_zone_id UUID NOT NULL,
    destination_zone_id UUID NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_origin_zone_rate
        FOREIGN KEY(origin_zone_id)
        REFERENCES zones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_destination_zone_rate
        FOREIGN KEY(destination_zone_id)
        REFERENCES zones(id)
        ON DELETE RESTRICT,
    UNIQUE(origin_zone_id, destination_zone_id) -- Zone combination is unique
);

CREATE TABLE IF NOT EXISTS status_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    origin_city_id UUID NOT NULL,
    destination_city_id UUID NOT NULL,
    package_weight_kg NUMERIC(10, 2) NOT NULL,
    package_length_cm NUMERIC(10, 2) NOT NULL,
    package_width_cm NUMERIC(10, 2) NOT NULL,
    package_height_cm NUMERIC(10, 2) NOT NULL,
    calculated_weight_kg NUMERIC(10, 2) NOT NULL,
    quoted_value NUMERIC(10, 2) NOT NULL,
    current_status_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_origin_city
        FOREIGN KEY(origin_city_id)
        REFERENCES cities(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_destination_city
        FOREIGN KEY(destination_city_id)
        REFERENCES cities(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_current_status
        FOREIGN KEY(current_status_id)
        REFERENCES status_types(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS shipment_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL,
    status_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment
        FOREIGN KEY(shipment_id)
        REFERENCES shipments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_history_status
        FOREIGN KEY(status_id)
        REFERENCES status_types(id)
        ON DELETE RESTRICT
);

INSERT INTO zones (id, name, description) VALUES
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'Zona Centro', 'Principales ciudades del centro del país'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Zona Eje Cafetero', 'Ciudades principales del Eje Cafetero'),
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'Zona Antioquia', 'Principales ciudades de Antioquia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, name) VALUES
('1e9e8d7c-6b5a-4f3e-2d1c-0b9a8e7d6c5b', 'Cundinamarca'),
('2f0f1e2d-3c4b-5a69-7889-9a0b1c2d3e4f', 'Risaralda'),
('3a4b5c6d-7e8f-9012-3456-7890abcdef01', 'Antioquia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cities (id, name, department_id, zone_id) VALUES
('4b5c6d7e-8f90-1234-5678-90abcdef0123', 'Bogota', '1e9e8d7c-6b5a-4f3e-2d1c-0b9a8e7d6c5b', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b'),
('5a6b7c8d-9e0f-1234-5678-90abcdef1234', 'Pereira', '2f0f1e2d-3c4b-5a69-7889-9a0b1c2d3e4f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('6c7d8e9f-0a1b-2345-6789-0abcdef12345', 'Medellin', '3a4b5c6d-7e8f-9012-3456-7890abcdef01', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rates (origin_zone_id, destination_zone_id, price_per_kg) VALUES
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 3.50), -- Bogotá (Zona Centro) to Medellín (Zona Antioquia)
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 3.00), -- Bogotá (Zona Centro) to Pereira (Zona Eje Cafetero)
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 2.80),  -- Pereira (Zona Eje Cafetero) to Bogotá (Zona Centro)
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 3.20)   -- Medellín (Zona Antioquia) to Bogotá (Zona Centro)
ON CONFLICT (origin_zone_id, destination_zone_id) DO NOTHING;

INSERT INTO status_types (id, name, description, is_final) VALUES
('1a2b3c4d-e5f6-7890-1234-567890abcdef', 'En espera', 'El envío ha sido creado y está a la espera de ser recolectado.', FALSE),
('2b3c4d5e-f6a7-8901-2345-67890abcdef0', 'En tránsito', 'El envío está en ruta hacia su destino.', FALSE),
('3c4d5e6f-a7b8-9012-3456-7890abcdef12', 'Entregado', 'El envío ha sido exitosamente entregado al destinatario.', TRUE)
ON CONFLICT (id) DO NOTHING;