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
    const userDriver4Id = uuidv4();
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
      {
        id: userOperatorId,
        name: 'Operatore',
        surname: 'Operatore',
        email: 'op@op.com',
        password: hashedPassword,
        role: 'operator',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver1Id,
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@email.com',
        password: hashedPassword,
        role: 'driver',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver2Id,
        name: 'Giulia',
        surname: 'Bianchi',
        email: 'giulia.bianchi@email.com',
        password: hashedPassword,
        role: 'driver',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver3Id,
        name: 'Luca',
        surname: 'Verdi',
        email: 'luca.verdi@email.com',
        password: hashedPassword,
        role: 'driver',
        tokens: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        id: userDriver4Id,
        name: 'Andrea',
        surname: 'Ferrari',
        email: 'andrea.ferrari@email.com',
        password: hashedPassword,
        role: 'driver',
        tokens: 500,
        createdAt: now,
        updatedAt: now
      }
    ]);

    console.log('🌱 Seeding Parkings...');
    await queryInterface.bulkInsert('Parkings', [
      {
        id: parkingDowntownId,
        name: 'Downtown Parking',
        address: 'Via Roma 15, Milan',
        carCapacity: 10,
        motorcycleCapacity: 5,
        truckCapacity: 2,
        carCapacityRemain: 10,
        motorcycleCapacityRemain: 5,
        truckCapacityRemain: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: parkingStationId,
        name: 'Station Parking',
        address: 'Piazza Garibaldi 3, Milan',
        carCapacity: 10,
        motorcycleCapacity: 2,
        truckCapacity: 0,
        carCapacityRemain: 10,
        motorcycleCapacityRemain: 2,
        truckCapacityRemain: 0,
        createdAt: now,
        updatedAt: now
      }
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
      { plate: plateCarA, type: 'car', ownerId: userDriver1Id, createdAt: now, updatedAt: now },
      { plate: plateMotoB, type: 'motorcycle', ownerId: userDriver2Id, createdAt: now, updatedAt: now },
      { plate: plateCarC, type: 'car', ownerId: userDriver3Id, createdAt: now, updatedAt: now },
      { plate: plateTruckD, type: 'truck', ownerId: userDriver3Id, createdAt: now, updatedAt: now },
      { plate: plateCarE, type: 'car', ownerId: userDriver1Id, createdAt: now, updatedAt: now },
      { plate: plateCarF, type: 'car', ownerId: userDriver2Id, createdAt: now, updatedAt: now }
    ]);

    console.log('🌱 Seeding Rates...');
    await queryInterface.bulkInsert('Rates', [
      // =========================
      // DOWNTOWN
      // =========================
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'car',        dayType: 'weekday', price: 2.0, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'car',        dayType: 'weekday', price: 1.5, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'car',        dayType: 'weekend', price: 2.5, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'car',        dayType: 'weekend', price: 2.0, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },

      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'motorcycle', dayType: 'weekday', price: 1.0, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'motorcycle', dayType: 'weekday', price: 0.8, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'motorcycle', dayType: 'weekend', price: 1.2, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'motorcycle', dayType: 'weekend', price: 1.0, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },

      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'truck',      dayType: 'weekday', price: 4.0, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'truck',      dayType: 'weekday', price: 3.0, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'truck',      dayType: 'weekend', price: 5.0, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingDowntownId, vehicleType: 'truck',      dayType: 'weekend', price: 4.0, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },

      // =========================
      // STATION
      // =========================
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'car',        dayType: 'weekday', price: 1.8, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'car',        dayType: 'weekday', price: 1.2, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'car',        dayType: 'weekend', price: 2.2, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'car',        dayType: 'weekend', price: 1.6, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },

      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'motorcycle', dayType: 'weekday', price: 0.9, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'motorcycle', dayType: 'weekday', price: 0.6, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'motorcycle', dayType: 'weekend', price: 1.1, hourStart: '08:00:00', hourEnd: '20:00:00', createdAt: now, updatedAt: now },
      { id: uuidv4(), parkingId: parkingStationId, vehicleType: 'motorcycle', dayType: 'weekend', price: 0.8, hourStart: '20:00:00', hourEnd: '08:00:00', createdAt: now, updatedAt: now }
    ]);

    // ==========================================================
    // 3. GENERAZIONE MASSIVA DI TRANSITI E FATTURE 
    // ==========================================================
    console.log('🚀 Generating mass data (transits + invoices)...');

    const transits = [];
    const invoices = [];

    const scenarios = [
      { plate: plateCarA,  user: userDriver1Id, park: parkingDowntownId, gIn: gateDownIn,  gOut: gateDownOut, basePrice: 5 },
      { plate: plateMotoB, user: userDriver2Id, park: parkingDowntownId, gIn: gateDownBi,  gOut: gateDownBi,  basePrice: 2 },
      { plate: plateCarC,  user: userDriver3Id, park: parkingStationId,  gIn: gateStatIn,  gOut: gateStatOut, basePrice: 4 },
      { plate: plateCarA,  user: userDriver1Id, park: parkingStationId,  gIn: gateStatBi,  gOut: gateStatOut, basePrice: 4.5 },
      { plate: plateMotoB, user: userDriver2Id, park: parkingStationId,  gIn: gateStatIn,  gOut: gateStatOut, basePrice: 2.5 },
      { plate: plateCarE,  user: userDriver1Id, park: parkingDowntownId, gIn: gateDownIn,  gOut: gateDownOut, basePrice: 5 },
      { plate: plateCarF,  user: userDriver2Id, park: parkingDowntownId, gIn: gateDownIn,  gOut: gateDownOut, basePrice: 5 },
      { plate: plateTruckD,user: userDriver3Id, park: parkingDowntownId, gIn: gateDownBi,  gOut: gateDownBi,  basePrice: 10 }
    ];

    const statuses = ['paid', 'paid', 'paid', 'unpaid', 'expired'];

    const parkingCaps = {
      [parkingDowntownId]: { car: 10, motorcycle: 5, truck: 2 },
      [parkingStationId]:  { car: 10, motorcycle: 2, truck: 0 }
    };

    const plateType = {
      [plateCarA]:  'car',
      [plateMotoB]: 'motorcycle',
      [plateCarC]:  'car',
      [plateTruckD]:'truck',
      [plateCarE]:  'car',
      [plateCarF]:  'car'
    };

    const sessions = []; // { parkingId, vehicleType, entryTime, exitTime }

    function overlaps(aStart, aEnd, bStart, bEnd) {
      return aStart < bEnd && bStart < aEnd;
    }

    // Verifica se è possibile schedulare una sessione di parcheggio
    function canSchedule(parkingId, vehicleType, entryTime, exitTime) {
      const cap = (parkingCaps[parkingId] && parkingCaps[parkingId][vehicleType]) ?? 0;
      if (cap <= 0) return false;

      const used = sessions.filter((s) => {
        return (
          s.parkingId === parkingId &&
          s.vehicleType === vehicleType &&
          overlaps(entryTime, exitTime, s.entryTime, s.exitTime)
        );
      }).length;

      return used < cap;
    }

    // Aggiunge minuti a una data
    const addMinutes = (d, minutes) => new Date(d.getTime() + minutes * 60 * 1000);
    // Data minima per i transiti (30 giorni fa)
    const min30Days = () => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ultimo OUT per targa -> garantisce IN/OUT alternati e niente "due parcheggi"
    const lastExitByPlate = new Map();
    Object.keys(plateType).forEach((plate) => {
      lastExitByPlate.set(plate, min30Days());
    });

    // Numero di transiti da generare
    const TARGET = 100;

    // Generazione transiti e fatture
    for (let idx = 0; idx < TARGET; idx++) {
      let sc = null;
      let entryTime = null;
      let exitTime = null;
      let durationHours = null;

      // Tenta di generare una sessione valida
      for (let attempt = 0; attempt < 800; attempt++) {
        sc = scenarios[Math.floor(Math.random() * scenarios.length)];
        const vehicleType = plateType[sc.plate];
        if (!vehicleType) continue;

        const lastExit = lastExitByPlate.get(sc.plate) || min30Days();

        // ingresso dopo l'ultimo OUT della targa
        const minutesForward = 10 + Math.floor(Math.random() * 3 * 24 * 60);
        entryTime = addMinutes(lastExit, minutesForward);

        const minDate = min30Days();
        if (entryTime < minDate) entryTime = minDate;
        if (entryTime > now) continue;

        durationHours = 1 + Math.floor(Math.random() * 4);
        exitTime = new Date(entryTime);
        exitTime.setHours(exitTime.getHours() + durationHours);
        if (exitTime > now) continue;

        if (!canSchedule(sc.park, vehicleType, entryTime, exitTime)) continue;

        sessions.push({ parkingId: sc.park, vehicleType, entryTime, exitTime });
        break;
      }

      if (!sc || !entryTime || !exitTime || !durationHours) {
        throw new Error('Seeder: non sono riuscito a generare una sessione valida');
      }

      const tInId = uuidv4();
      const tOutId = uuidv4();

      const amount = parseFloat((sc.basePrice * durationHours + Math.random()).toFixed(2));

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

      lastExitByPlate.set(sc.plate, exitTime);

      const dueDate = new Date(exitTime);
      dueDate.setDate(dueDate.getDate() + 1);

      invoices.push({
        id: uuidv4(),
        userId: sc.user,
        parkingId: sc.park,
        entryTransitId: tInId,
        exitTransitId: tOutId,
        amount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        dueDate,
        createdAt: exitTime,
        updatedAt: exitTime
      });
    }

    // ==========================================================
    // 4. SCRITTURA NEL DB
    // ==========================================================
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