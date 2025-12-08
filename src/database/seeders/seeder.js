'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // ===== ID FISSI PER RELAZIONI =====
    const userDriver1Id = uuidv4();
    const userDriver2Id = uuidv4();
    const userDriver3Id = uuidv4();
    const userOperatorId = uuidv4();

    const parkingDowntownId = uuidv4();
    const parkingStationId = uuidv4();

    const gate1Id = uuidv4();
    const gate2Id = uuidv4();
    const gate3Id = uuidv4();
    const gate4Id = uuidv4();
    const gate5Id = uuidv4();
    const gate6Id = uuidv4();

    // ===== 1. USERS =====
    await queryInterface.bulkInsert('Users', [
      {
        id: userDriver1Id,
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver2Id,
        name: 'Giulia',
        surname: 'Bianchi',
        email: 'giulia.bianchi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver3Id,
        name: 'Luca',
        surname: 'Verdi',
        email: 'luca.verdi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userOperatorId,
        name: 'Andrea',
        surname: 'Ferrari',
        email: 'andrea.ferrari@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'OPERATOR',
        tokens: 500,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // ===== 2. PARKINGS =====
    await queryInterface.bulkInsert('Parkings', [
      {
        id: parkingDowntownId,
        name: 'Downtown Parking',
        address: 'Via Roma 15, Milan',
        carCapacity: 100,
        motorcycleCapacity: 20,
        truckCapacity: 10,
        createdAt: now,
        updatedAt: now
      },
      {
        id: parkingStationId,
        name: 'Station Parking',
        address: 'Piazza Garibaldi 3, Milan',
        carCapacity: 150,
        motorcycleCapacity: 30,
        truckCapacity: 15,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // ===== 3. GATES =====
    await queryInterface.bulkInsert('Gates', [
      // Downtown Parking (1–3)
      {
        id: gate1Id,
        parkingId: parkingDowntownId,
        type: 'standard',
        direction: 'in',
        createdAt: now,
        updatedAt: now
      },
      {
        id: gate2Id,
        parkingId: parkingDowntownId,
        type: 'standard',
        direction: 'out',
        createdAt: now,
        updatedAt: now
      },
      {
        id: gate3Id,
        parkingId: parkingDowntownId,
        type: 'smart',
        direction: 'bidirectional',
        createdAt: now,
        updatedAt: now
      },
      // Station Parking (4–6)
      {
        id: gate4Id,
        parkingId: parkingStationId,
        type: 'smart',
        direction: 'in',
        createdAt: now,
        updatedAt: now
      },
      {
        id: gate5Id,
        parkingId: parkingStationId,
        type: 'smart',
        direction: 'out',
        createdAt: now,
        updatedAt: now
      },
      {
        id: gate6Id,
        parkingId: parkingStationId,
        type: 'standard',
        direction: 'bidirectional',
        createdAt: now,
        updatedAt: now
      }
    ]);

    // ===== 4. VEHICLES =====
    await queryInterface.bulkInsert('Vehicles', [
      {
        license_plate: 'AB123CD',
        vehicle_type: 'car',
        owner_id: userDriver1Id,
        createdAt: now,
        updatedAt: now
      },
      {
        license_plate: 'EF456GH',
        vehicle_type: 'motorcycle',
        owner_id: userDriver2Id,
        createdAt: now,
        updatedAt: now
      },
      {
        license_plate: 'IJ789KL',
        vehicle_type: 'car',
        owner_id: userDriver3Id,
        createdAt: now,
        updatedAt: now
      },
      {
        license_plate: 'MN012OP',
        vehicle_type: 'truck',
        owner_id: userDriver3Id,
        createdAt: now,
        updatedAt: now
      }
    ]);

    await queryInterface.bulkInsert('Rates', [
      {
        id: uuidv4(),
        parkingId: parkingDowntownId,
        vehicleType: 'car',       
        dayType: 'weekday',       
        hourStart: '08:00:00',
        hourEnd: '20:00:00',
        price: 2.50,              
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        parkingId: parkingDowntownId,
        vehicleType: 'car',
        dayType: 'weekday',
        hourStart: '20:00:00',
        hourEnd: '08:00:00',
        price: 1.00,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        parkingId: parkingDowntownId,
        vehicleType: 'motorcycle',
        dayType: 'all',
        hourStart: '00:00:00',
        hourEnd: '23:59:59',
        price: 1.00,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        parkingId: parkingStationId,
        vehicleType: 'car',
        dayType: 'weekday',
        hourStart: '06:00:00',
        hourEnd: '22:00:00',
        price: 3.00,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        parkingId: parkingStationId,
        vehicleType: 'truck',
        dayType: 'all',
        hourStart: '00:00:00',
        hourEnd: '23:59:59',
        price: 5.00,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // ===== 6. TRANSITS =====
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 30, 0, 0);

    const yesterdayExit = new Date(yesterday);
    yesterdayExit.setHours(14, 15, 0, 0);

    const today = new Date(now);
    today.setHours(9, 0, 0, 0);

    await queryInterface.bulkInsert('Transits', [
      {
        id: 1,
        vehicle_id: 'AB123CD',
        gate_id: gate1Id,
        parking_lot_id: parkingDowntownId,
        transit_type: 'entrance',
        date_time: yesterday,
        image_path: '/images/transits/img001.jpg',
        detected_license_plate: 'AB123CD',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        vehicle_id: 'AB123CD',
        gate_id: gate2Id,
        parking_lot_id: parkingDowntownId,
        transit_type: 'exit',
        date_time: yesterdayExit,
        image_path: '/images/transits/img002.jpg',
        detected_license_plate: 'AB123CD',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        vehicle_id: 'EF456GH',
        gate_id: gate4Id,
        parking_lot_id: parkingStationId,
        transit_type: 'entrance',
        date_time: today,
        image_path: null,
        detected_license_plate: 'EF456GH',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        vehicle_id: 'IJ789KL',
        gate_id: gate1Id,
        parking_lot_id: parkingDowntownId,
        transit_type: 'entrance',
        date_time: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        image_path: '/images/transits/img003.jpg',
        detected_license_plate: 'IJ789KL',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        vehicle_id: 'IJ789KL',
        gate_id: gate2Id,
        parking_lot_id: parkingDowntownId,
        transit_type: 'exit',
        date_time: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        image_path: '/images/transits/img004.jpg',
        detected_license_plate: 'IJ789KL',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        vehicle_id: 'MN012OP',
        gate_id: gate4Id,
        parking_lot_id: parkingStationId,
        transit_type: 'entrance',
        date_time: new Date(yesterday.getTime() - 2 * 60 * 60 * 1000),
        image_path: null,
        detected_license_plate: 'MN012OP',
        createdAt: now,
        updatedAt: now
      }
    ]);

    // ===== 7. INVOICES =====
    const dueDate1 = new Date(yesterdayExit);
    dueDate1.setDate(dueDate1.getDate() + 1);

    const dueDate2 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    dueDate2.setDate(dueDate2.getDate() + 1);

    await queryInterface.bulkInsert('Invoices', [
      {
        id: 1,
        vehicle_id: 'AB123CD',
        parking_lot_id: parkingDowntownId,
        driver_id: userDriver1Id,
        entrance_transit_id: 1,
        exit_transit_id: 2,
        amount: 10.00,
        payment_status: 'paid',
        due_date: dueDate1,
        payment_date: yesterdayExit,
        qr_code_path: '/invoices/qr_001.pdf',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        vehicle_id: 'IJ789KL',
        parking_lot_id: parkingDowntownId,
        driver_id: userDriver3Id,
        entrance_transit_id: 4,
        exit_transit_id: 5,
        amount: 5.00,
        payment_status: 'unpaid',
        due_date: dueDate2,
        payment_date: null,
        qr_code_path: '/invoices/qr_002.pdf',
        createdAt: now,
        updatedAt: now
      }
    ]);

    console.log('✅ Seeding completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Invoices', null, {});
    await queryInterface.bulkDelete('Transits', null, {});
    await queryInterface.bulkDelete('Rates', null, {});
    await queryInterface.bulkDelete('Vehicles', null, {});
    await queryInterface.bulkDelete('Gates', null, {});
    await queryInterface.bulkDelete('Parkings', null, {});
    await queryInterface.bulkDelete('Users', null, {});

    console.log('✅ Rollback completed!');
  }
};