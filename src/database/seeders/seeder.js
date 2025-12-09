'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ==========================================================
    // 1. COSTANTI E ID FISSI (Infrastruttura)
    // ==========================================================

    const userDriver1Id = uuidv4();
    const userDriver2Id = uuidv4();
    const userDriver3Id = uuidv4();
    const userOperatorId = uuidv4();

    const parkingDowntownId = uuidv4();
    const parkingStationId = uuidv4();

    // Gates
    const gateDownIn = uuidv4();
    const gateDownOut = uuidv4();
    const gateDownBi = uuidv4();
    const gateStatIn = uuidv4();
    const gateStatOut = uuidv4();
    const gateStatBi = uuidv4();

    // Vehicles
    const plateCarA = 'FV181EX'; // Owner: Driver1
    const plateMotoB = 'ZA22321'; // Owner: Driver2
    const plateCarC = 'GA129KM'; // Owner: Driver3
    const plateTruckD = 'DW367BX'; // Owner: Driver3
    const plateCarE = 'AA000AA'; // Owner: Driver1
    const plateCarF = 'BB111BB'; // Owner: Driver2

    // ==========================================================
    // 2. INSERIMENTO ENTITÀ BASE
    // ==========================================================

    console.log('🌱 Seeding Users...');
    await queryInterface.bulkInsert('Users', [
      { id: userDriver1Id, name: 'Mario', surname: 'Rossi', email: 'mario.rossi@email.com', password: hashedPassword, role: 'DRIVER', tokens: 100, createdAt: now, updatedAt: now },
      { id: userDriver2Id, name: 'Giulia', surname: 'Bianchi', email: 'giulia.bianchi@email.com', password: hashedPassword, role: 'DRIVER', tokens: 100, createdAt: now, updatedAt: now },
      { id: userDriver3Id, name: 'Luca', surname: 'Verdi', email: 'luca.verdi@email.com', password: hashedPassword, role: 'DRIVER', tokens: 100, createdAt: now, updatedAt: now },
      { id: userOperatorId, name: 'Andrea', surname: 'Ferrari', email: 'andrea.ferrari@email.com', password: hashedPassword, role: 'OPERATOR', tokens: 500, createdAt: now, updatedAt: now }
    ]);

    console.log('🌱 Seeding Parkings...');
    await queryInterface.bulkInsert('Parkings', [
      { id: parkingDowntownId, name: 'Downtown Parking', address: 'Via Roma 15, Milan', carCapacity: 3, motorcycleCapacity: 2, truckCapacity: 1, createdAt: now, updatedAt: now },
      { id: parkingStationId, name: 'Station Parking', address: 'Piazza Garibaldi 3, Milan', carCapacity: 0, motorcycleCapacity: 2, truckCapacity: 0, createdAt: now, updatedAt: now }
    ]);

    console.log('🌱 Seeding Gates...');
    await queryInterface.bulkInsert('Gates', [
      { id: gateDownIn, parkingId: parkingDowntownId, type: 'standard', direction: 'in', createdAt: now, updatedAt: now },
      { id: gateDownOut, parkingId: parkingDowntownId, type: 'standard', direction: 'out', createdAt: now, updatedAt: now },
      { id: gateDownBi, parkingId: parkingDowntownId, type: 'smart', direction: 'bidirectional', createdAt: now, updatedAt: now },
      { id: gateStatIn, parkingId: parkingStationId, type: 'smart', direction: 'in', createdAt: now, updatedAt: now },
      { id: gateStatOut, parkingId: parkingStationId, type: 'smart', direction: 'out', createdAt: now, updatedAt: now },
      { id: gateStatBi, parkingId: parkingStationId, type: 'standard', direction: 'bidirectional', createdAt: now, updatedAt: now }
    ]);

    console.log('🌱 Seeding Vehicles...');
    await queryInterface.bulkInsert('Vehicles', [
      { plate: plateCarA, type: 'car', ownerId: userDriver1Id,imagePath:'src/img/img_prova1.png', jsonPath: null,createdAt: now, updatedAt: now },
      { plate: plateMotoB, type: 'motorcycle', ownerId: userDriver2Id, imagePath:'src/img/img_prova4.png',jsonPath:null,createdAt: now, updatedAt: now },
      { plate: plateCarC, type: 'car', ownerId: userDriver3Id,imagePath:'src/img/img_prova2.png', jsonPath: null,createdAt: now, updatedAt: now },
      { plate: plateTruckD, type: 'truck', ownerId: userDriver3Id,imagePath:'src/img/img_prova3.png', jsonPath: null, createdAt: now, updatedAt: now },
      { plate: plateCarE, type: 'car', ownerId: userDriver1Id,imagePath:'src/img/img_prova1.png', jsonPath: null,createdAt: now, updatedAt: now },
      { plate: plateCarF, type: 'car', ownerId: userDriver1Id,imagePath:'src/img/img_prova4.png', jsonPath: null,createdAt: now, updatedAt: now },
    ]);

    // ==========================================================
    // 3. GENERAZIONE MASSIVA DI TRANSITI E FATTURE
    // ==========================================================
    console.log('🚀 Generating mass data (50+ records)...');

    const transits = [];
    const invoices = [];

    // Helper: Definiamo le possibili combinazioni veicolo/utente/parcheggio
    const scenarios = [
      { plate: plateCarA, user: userDriver1Id, park: parkingDowntownId, gIn: gateDownIn, gOut: gateDownOut, basePrice: 5 },
      { plate: plateMotoB, user: userDriver2Id, park: parkingDowntownId, gIn: gateDownBi, gOut: gateDownBi, basePrice: 2 },
      { plate: plateCarC, user: userDriver3Id, park: parkingStationId, gIn: gateStatIn, gOut: gateStatOut, basePrice: 4 },
      { plate: plateTruckD, user: userDriver3Id, park: parkingStationId, gIn: gateStatIn, gOut: gateStatBi, basePrice: 10 },
      { plate: plateCarA, user: userDriver1Id, park: parkingStationId, gIn: gateStatBi, gOut: gateStatOut, basePrice: 4.5 },
      { plate: plateMotoB, user: userDriver2Id, park: parkingStationId, gIn: gateStatIn, gOut: gateStatOut, basePrice: 2.5 },
      { plate: plateCarE, user: userDriver1Id, park: parkingDowntownId, gIn: gateDownIn, gOut: gateDownOut, basePrice: 5 },
      { plate: plateCarF, user: userDriver1Id, park: parkingDowntownId, gIn: gateDownIn, gOut: gateDownOut, basePrice: 5 }
    ];

    const statuses = ['paid', 'paid', 'paid', 'unpaid', 'expired']; // Più probabilità di PAID

    // Generiamo 50 eventi negli ultimi 30 giorni
    for (let i = 0; i < 50; i++) {
      // 1. Scegli scenario random
      const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      // 2. Scegli data random negli ultimi 30 giorni
      const daysBack = Math.floor(Math.random() * 30);
      const entryTime = new Date(now);
      entryTime.setDate(entryTime.getDate() - daysBack);
      entryTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60)); // Tra le 8:00 e le 18:00

      // 3. Genera uscita (tra 1 e 5 ore dopo)
      const durationHours = 1 + Math.floor(Math.random() * 4);
      const exitTime = new Date(entryTime);
      exitTime.setHours(exitTime.getHours() + durationHours);

      // 4. Crea ID Transiti
      const tInId = uuidv4();
      const tOutId = uuidv4();

      // 5. Calcola importo (prezzo base * ore + random centesimi)
      const amount = parseFloat((sc.basePrice * durationHours + Math.random()).toFixed(2));

      // 6. Push Transiti
      transits.push({
        id: tInId,
        vehicleId: sc.plate,
        gateId: sc.gIn,
        parkingId: sc.park,
        type: 'in',
        date: entryTime,
        detectedPlate: sc.plate,
        createdAt: entryTime,
        updatedAt: entryTime
      });

      transits.push({
        id: tOutId,
        vehicleId: sc.plate,
        gateId: sc.gOut,
        parkingId: sc.park,
        type: 'out',
        date: exitTime,
        detectedPlate: sc.plate,
        createdAt: exitTime,
        updatedAt: exitTime
      });

      // 7. Push Fattura
      const dueDate = new Date(exitTime);
      dueDate.setDate(dueDate.getDate() + 1); // Scadenza 1 giorno dopo

      invoices.push({
        id: uuidv4(),
        userId: sc.user,
        parkingId: sc.park,
        entryTransitId: tInId,
        exitTransitId: tOutId,
        amount: amount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        dueDate: dueDate,
        qrPath: `/invoices/gen_${i}.pdf`,
        createdAt: exitTime, // Creata all'uscita
        updatedAt: exitTime
      });
    }
    // SCRITTURA NEL DB
    await queryInterface.bulkInsert('Transits', transits);
    await queryInterface.bulkInsert('Invoices', invoices);

    console.log(`✅ Generated ${transits.length} transits and ${invoices.length} invoices successfully!`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Invoices', null, {});
    await queryInterface.bulkDelete('Transits', null, {});
    await queryInterface.bulkDelete('Rates', null, {});
    await queryInterface.bulkDelete('Vehicles', null, {});
    await queryInterface.bulkDelete('Gates', null, {});
    await queryInterface.bulkDelete('Parkings', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
