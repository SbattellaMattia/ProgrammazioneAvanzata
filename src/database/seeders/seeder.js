'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // ===== 1. USERS =====
    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,  
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'Giulia',
        surname: 'Bianchi',
        email: 'giulia.bianchi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'Luca',
        surname: 'Verdi',
        email: 'luca.verdi@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'DRIVER',
        tokens: 100,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        name: 'Andrea',
        surname: 'Ferrari',
        email: 'andrea.ferrari@email.com',
        password: await bcrypt.hash('password123', 10),
        role: 'OPERATOR',
        tokens: 500,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ===== 2. PARKING LOTS =====
    await queryInterface.bulkInsert('Parkings', [
      {
        id: 1,
        name: 'Downtown Parking',
        address: 'Via Roma 15, Milan',
        carCapacity: 100,
        motorcycleCapacity: 20,
        truckCapacity: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Station Parking',
        address: 'Piazza Garibaldi 3, Milan',
        carCapacity: 150,
        motorcycleCapacity: 30,
        truckCapacity: 15,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ===== 3. GATES =====
    await queryInterface.bulkInsert('Gates', [
      // Downtown Parking
      {
        id: 1,
        parking_lot_id: 1,
        type: 'standard',
        direction: 'entrance',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        parking_lot_id: 1,
        type: 'standard',
        direction: 'exit',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        parking_lot_id: 1,
        type: 'smart',
        direction: 'bidirectional',
        createdAt: now,
        updatedAt: now,
      },
      // Station Parking
      {
        id: 4,
        parking_lot_id: 2,
        type: 'smart',
        direction: 'entrance',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        parking_lot_id: 2,
        type: 'smart',
        direction: 'exit',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        parking_lot_id: 2,
        type: 'standard',
        direction: 'bidirectional',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ===== 4. VEHICLES =====
    await queryInterface.bulkInsert('Vehicles', [
      {
        license_plate: 'AB123CD',
        vehicle_type: 'car',
        owner_id: null, // Will need actual UUID from Users if you want to link
        createdAt: now,
        updatedAt: now,
      },
      {
        license_plate: 'EF456GH',
        vehicle_type: 'motorcycle',
        owner_id: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        license_plate: 'IJ789KL',
        vehicle_type: 'car',
        owner_id: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        license_plate: 'MN012OP',
        vehicle_type: 'truck',
        owner_id: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ===== 5. RATES =====
    await queryInterface.bulkInsert('Rates', [
      {
        id: 1,
        parking_lot_id: 1,
        vehicle_type: 'car',
        day: 'weekday',
        time_slot_start: '08:00:00',
        time_slot_end: '20:00:00',
        hourly_rate: 2.50,
        daily_rate: 15.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        parking_lot_id: 1,
        vehicle_type: 'car',
        day: 'weekday',
        time_slot_start: '20:00:00',
        time_slot_end: '08:00:00',
        hourly_rate: 1.00,
        daily_rate: 10.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        parking_lot_id: 1,
        vehicle_type: 'motorcycle',
        day: 'all',
        time_slot_start: '00:00:00',
        time_slot_end: '23:59:59',
        hourly_rate: 1.00,
        daily_rate: 5.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        parking_lot_id: 2,
        vehicle_type: 'car',
        day: 'weekday',
        time_slot_start: '06:00:00',
        time_slot_end: '22:00:00',
        hourly_rate: 3.00,
        daily_rate: 20.00,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        parking_lot_id: 2,
        vehicle_type: 'truck',
        day: 'all',
        time_slot_start: '00:00:00',
        time_slot_end: '23:59:59',
        hourly_rate: 5.00,
        daily_rate: 40.00,
        createdAt: now,
        updatedAt: now,
      },
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
        gate_id: 1,
        parking_lot_id: 1,
        transit_type: 'entrance',
        date_time: yesterday,
        image_path: '/images/transits/img001.jpg',
        detected_license_plate: 'AB123CD',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        vehicle_id: 'AB123CD',
        gate_id: 2,
        parking_lot_id: 1,
        transit_type: 'exit',
        date_time: yesterdayExit,
        image_path: '/images/transits/img002.jpg',
        detected_license_plate: 'AB123CD',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        vehicle_id: 'EF456GH',
        gate_id: 4,
        parking_lot_id: 2,
        transit_type: 'entrance',
        date_time: today,
        image_path: null,
        detected_license_plate: 'EF456GH',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        vehicle_id: 'IJ789KL',
        gate_id: 1,
        parking_lot_id: 1,
        transit_type: 'entrance',
        date_time: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        image_path: '/images/transits/img003.jpg',
        detected_license_plate: 'IJ789KL',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        vehicle_id: 'IJ789KL',
        gate_id: 2,
        parking_lot_id: 1,
        transit_type: 'exit',
        date_time: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        image_path: '/images/transits/img004.jpg',
        detected_license_plate: 'IJ789KL',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        vehicle_id: 'MN012OP',
        gate_id: 4,
        parking_lot_id: 2,
        transit_type: 'entrance',
        date_time: new Date(yesterday.getTime() - 2 * 60 * 60 * 1000),
        image_path: null,
        detected_license_plate: 'MN012OP',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ===== 7. INVOICES =====
    const dueDate1 = new Date(yesterdayExit);
    dueDate1.setDate(dueDate1.getDate() + 1);

    const dueDate2 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    dueDate2.setDate(dueDate2.getDate() + 1);

    // Get user IDs to link invoices (you'll need to query or use fixed UUIDs)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" ORDER BY "createdAt" LIMIT 3',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('Invoices', [
      {
        id: 1,
        vehicle_id: 'AB123CD',
        parking_lot_id: 1,
        driver_id: users[0].id,
        entrance_transit_id: 1,
        exit_transit_id: 2,
        amount: 10.00,
        payment_status: 'paid',
        due_date: dueDate1,
        payment_date: yesterdayExit,
        qr_code_path: '/invoices/qr_001.pdf',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        vehicle_id: 'IJ789KL',
        parking_lot_id: 1,
        driver_id: users[2].id,
        entrance_transit_id: 4,
        exit_transit_id: 5,
        amount: 5.00,
        payment_status: 'unpaid',
        due_date: dueDate2,
        payment_date: null,
        qr_code_path: '/invoices/qr_002.pdf',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log('✅ Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 4 users (3 drivers + 1 operator)');
    console.log('   - 2 parking lots with 3 gates each');
    console.log('   - 4 vehicles');
    console.log('   - 5 rates');
    console.log('   - 6 transits (2 completed, 2 entrance only)');
    console.log('   - 2 invoices (only for completed transits)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Invoices', null, {});
    await queryInterface.bulkDelete('Transits', null, {});
    await queryInterface.bulkDelete('Rates', null, {});
    await queryInterface.bulkDelete('Vehicles', null, {});
    await queryInterface.bulkDelete('Gates', null, {});
    await queryInterface.bulkDelete('Parking', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    
    console.log('✅ Rollback completed!');
  }
};
