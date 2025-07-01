# Realtime Shipment Status instruction

Realtime shipment status feature works the following way:

1. The user quotes a shipment.
2. The user creates a shipment.
3. The user tracks the shipment status.
4. A WebSocket connection is established.
5. Something updates the shipment status.
6. A database trigger is fired.
7. The database trigger sends a database notification.
8. A listener is listening for the database notification.
9. The listener sends a message to the client via the WebSocket connection.

If you want to test the feature, you can use the following commands.

When services are running, open a terminal and enter the PostgresSQL container running the following command:

```bash
docker exec -it shipping-db-prod psql -U user -d shipping
```

Now you can run the following commands to update the shipment status:

```bash
UPDATE shipments
SET current_status_id = '1a2b3c4d-e5f6-7890-1234-567890abcdef'
WHERE id = <SHIPMENT ID HERE>;

UPDATE shipments
SET current_status_id = '2b3c4d5e-f6a7-8901-2345-67890abcdef0'
WHERE id = <SHIPMENT ID HERE>;

UPDATE shipments
SET current_status_id = '3c4d5e6f-a7b8-9012-3456-7890abcdef12'
WHERE id = <SHIPMENT ID HERE>;
```

This will update the shipment status to `Quoted`, `Shipped` and `Delivered` respectively. You can check the frontend to see the changes.
