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
    current_status_id UUID NOT NULL DEFAULT '1a2b3c4d-e5f6-7890-1234-567890abcdef',
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

CREATE OR REPLACE FUNCTION add_initial_shipment_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO shipment_status_history (shipment_id, status_id, timestamp)
    VALUES (NEW.id, NEW.current_status_id, CURRENT_TIMESTAMP);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_initial_shipment_history
AFTER INSERT ON shipments
FOR EACH ROW
EXECUTE FUNCTION add_initial_shipment_history();

INSERT INTO zones (id, name, description) VALUES
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'Zona Centro', 'Principales ciudades del centro del país'),
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Zona Eje Cafetero', 'Ciudades principales del Eje Cafetero'),
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'Zona Antioquia', 'Principales ciudades de Antioquia'),
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'Zona Caribe', 'Ciudades importantes de la costa Caribe'),
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'Zona Pacífica', 'Ciudades principales de la región Pacífica'),
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'Zona Oriente', 'Ciudades del oriente colombiano')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, name) VALUES
('1e9e8d7c-6b5a-4f3e-2d1c-0b9a8e7d6c5b', 'Cundinamarca'),
('2f0f1e2d-3c4b-5a69-7889-9a0b1c2d3e4f', 'Risaralda'),
('3a4b5c6d-7e8f-9012-3456-7890abcdef01', 'Antioquia'),
('4e5f6a7b-8c9d-0123-4567-890abcdef012', 'Atlántico'),
('5f6a7b8c-9d0e-1234-5678-90abcdef1234', 'Valle del Cauca'),
('6a7b8c9d-0e1f-2345-6789-0abcdef12345', 'Santander'),
('7b8c9d0e-1f2a-3456-7890-abcdef123456', 'Boyacá'),
('8c9d0e1f-2a3b-4567-8901-23456789abcd', 'Quindío')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cities (id, name, department_id, zone_id) VALUES
('4b5c6d7e-8f90-1234-5678-90abcdef0123', 'Bogota', '1e9e8d7c-6b5a-4f3e-2d1c-0b9a8e7d6c5b', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b'),
('5a6b7c8d-9e0f-1234-5678-90abcdef1234', 'Pereira', '2f0f1e2d-3c4b-5a69-7889-9a0b1c2d3e4f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('6c7d8e9f-0a1b-2345-6789-0abcdef12345', 'Medellin', '3a4b5c6d-7e8f-9012-3456-7890abcdef01', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234'),
('7d8e9f0a-1b2c-3456-7890-abcdef123456', 'Barranquilla', '4e5f6a7b-8c9d-0123-4567-890abcdef012', 'd7e8f9a0-b1c2-3456-7890-abcdef123456'),
('8e9f0a1b-2c3d-4567-8901-23456789abcd', 'Cartagena', '4e5f6a7b-8c9d-0123-4567-890abcdef012', 'd7e8f9a0-b1c2-3456-7890-abcdef123456'),
('9f0a1b2c-3d4e-5678-9012-34567890abcd', 'Cali', '5f6a7b8c-9d0e-1234-5678-90abcdef1234', 'e1f2a3b4-c5d6-7890-1234-567890abcdef'),
('a0b1c2d3-e4f5-6789-0123-4567890abcde', 'Bucaramanga', '6a7b8c9d-0e1f-2345-6789-0abcdef12345', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234'),
('b1c2d3e4-f5a6-7890-1234-567890abcdef', 'Tunja', '7b8c9d0e-1f2a-3456-7890-abcdef123456', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234'),
('c2d3e4f5-a6b7-8901-2345-67890abcdef0', 'Armenia', '8c9d0e1f-2a3b-4567-8901-23456789abcd', 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('d3e4f5a6-b7c8-9012-3456-7890abcdef12', 'Manizales', '2f0f1e2d-3c4b-5a69-7889-9a0b1c2d3e4f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rates (origin_zone_id, destination_zone_id, price_per_kg) VALUES
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 3.50), -- Bogotá (Zona Centro) to Medellín (Zona Antioquia)
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 3.00), -- Bogotá (Zona Centro) to Pereira (Zona Eje Cafetero)
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 2.80), -- Pereira (Zona Eje Cafetero) to Bogotá (Zona Centro)
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 3.20), -- Medellín (Zona Antioquia) to Bogotá (Zona Centro)
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'd7e8f9a0-b1c2-3456-7890-abcdef123456', 4.00), -- Centro toa Caribe
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'e1f2a3b4-c5d6-7890-1234-567890abcdef', 4.20), -- Centro toa Pacífica
('b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234', 3.80), -- Centro toa Oriente
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 2.90), -- Eje Cafetero to Antioquia
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'd7e8f9a0-b1c2-3456-7890-abcdef123456', 3.70), -- Eje Cafetero to Caribe
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'e1f2a3b4-c5d6-7890-1234-567890abcdef', 3.50), -- Eje Cafetero to Pacífica
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234', 3.10), -- Eje Cafetero to Oriente
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 2.70), -- Antioquia to Eje Cafetero
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'd7e8f9a0-b1c2-3456-7890-abcdef123456', 3.90), -- Antioquia to Caribe
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'e1f2a3b4-c5d6-7890-1234-567890abcdef', 4.10), -- Antioquia to Pacífica
('c5d6e7f8-a9b0-1234-5678-90abcdef1234', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234', 3.60), -- Antioquia to Oriente
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 4.10), -- Caribe to Centro
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 3.80), -- Caribe to Eje Cafetero
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 3.95), -- Caribe to Antioquia
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'e1f2a3b4-c5d6-7890-1234-567890abcdef', 4.50), -- Caribe to Pacífica
('d7e8f9a0-b1c2-3456-7890-abcdef123456', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234', 4.30), -- Caribe to Oriente
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 4.30), -- Pacífica to Centro
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 3.60), -- Pacífica to Eje Cafetero
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 4.00), -- Pacífica to Antioquia
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'd7e8f9a0-b1c2-3456-7890-abcdef123456', 4.60), -- Pacífica to Caribe
('e1f2a3b4-c5d6-7890-1234-567890abcdef', 'f5a6b7c8-d9e0-1234-5678-90abcdef1234', 4.20), -- Pacífica to Oriente
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'b3c2a1d0-e4f5-4678-9a0b-1c2d3e4f5a6b', 3.70), -- Oriente to Centro
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 3.20), -- Oriente to Eje Cafetero
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'c5d6e7f8-a9b0-1234-5678-90abcdef1234', 3.50), -- Oriente to Antioquia
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'd7e8f9a0-b1c2-3456-7890-abcdef123456', 4.40), -- Oriente to Caribe
('f5a6b7c8-d9e0-1234-5678-90abcdef1234', 'e1f2a3b4-c5d6-7890-1234-567890abcdef', 4.00)  -- Oriente to Pacífica
ON CONFLICT (origin_zone_id, destination_zone_id) DO NOTHING;

INSERT INTO status_types (id, name, description, is_final) VALUES
('1a2b3c4d-e5f6-7890-1234-567890abcdef', 'On hold', 'Shipment has been created and is awaiting collection', FALSE),
('2b3c4d5e-f6a7-8901-2345-67890abcdef0', 'In transit', 'The shipment is en route to its destination', FALSE),
('3c4d5e6f-a7b8-9012-3456-7890abcdef12', 'Delivered', 'The shipment has been successfully delivered to the recipient', TRUE),
('4d5e6f7a-b8c9-0123-4567-890abcdef134', 'Collected', 'The shipment has been collected from the origin', FALSE),
('5e6f7a8b-c9d0-1234-5678-90abcdef1456', 'In distribution center', 'The shipment is in a sorting center', FALSE),
('6f7a8b9c-d0e1-2345-6789-0abcdef15678', 'Failed delivery attempt', 'Could not deliver shipment on first attempt', FALSE),
('7f8a9b0c-d1e2-3456-7890-abcdef167890', 'Exception', 'An unexpected problem has occurred with the shipment', FALSE),
('8a9b0c1d-e2f3-4567-8901-234567890abc', 'Cancelled', 'The shipment has been cancelled', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION log_shipment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSON;
    status_name TEXT;
    status_description TEXT;
BEGIN
    -- Only if current_status_id has changed
    IF OLD.current_status_id IS DISTINCT FROM NEW.current_status_id THEN
        -- Insert the record into the status history
        INSERT INTO shipment_status_history (shipment_id, status_id, timestamp)
        VALUES (NEW.id, NEW.current_status_id, CURRENT_TIMESTAMP);

        -- Update the shipment's modification timestamp
        NEW.updated_at = CURRENT_TIMESTAMP;

        -- Get the name of the new status for the notification payload
        SELECT name, description INTO status_name, status_description
        FROM status_types
        WHERE id = NEW.current_status_id;

        -- Build the JSON payload for the notification
        notification_payload := json_build_object(
            'shipmentId', NEW.id,
            'statusId', NEW.current_status_id,
            'statusName', status_name,
            'statusDescription', status_description,
            'timestamp', to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') -- ISO 8601 format
        );

        -- Send the notification to a specific channel
        -- 'shipment_updates' is the channel name. It must be consistent with the listener in the backend.
        PERFORM pg_notify('shipment_updates', notification_payload::text);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_shipment_status_change
AFTER UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION log_shipment_status_change();
