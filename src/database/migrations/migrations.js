'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    // ===== 1. USERS =====
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      surname: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('DRIVER', 'OPERATOR'),
        allowNull: false
      },
      tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    // ===== 2. PARKINGS =====
    await queryInterface.createTable('Parkings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      carCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      motorcycleCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      truckCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ===== 3. GATES =====
    await queryInterface.createTable('Gates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      parkingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Parkings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'standard, smart',
      },
      direction: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'in, out, bidirectional',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('Gates', ['parkingId'], {
      name: 'gates_parking_id_idx',
    });

    // ===== 4. VEHICLES =====
    await queryInterface.createTable('Vehicles', {
      license_plate: { // Mantengo snake_case qui se è la chiave primaria stringa legacy/standard
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      vehicle_type: { // Mantengo snake_case se preferito, altrimenti vehicleType
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'car, motorcycle, truck'
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ===== 5. TRANSITS =====
    await queryInterface.createTable('Transits', {
      id: {
        type: Sequelize.UUID, // CAMBIATO IN UUID
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      vehicleId: { // CAMBIATO IN CAMELCASE
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'license_plate'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gateId: { // CAMBIATO IN CAMELCASE
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Gates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parkingId: { // CAMBIATO IN CAMELCASE
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Parkings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transitType: { // CAMBIATO IN CAMELCASE
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'entrance, exit'
      },
      dateTime: { // CAMBIATO IN CAMELCASE
        type: Sequelize.DATE,
        allowNull: false
      },
      imagePath: { // CAMBIATO IN CAMELCASE
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      detectedLicensePlate: { // CAMBIATO IN CAMELCASE
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index aggiornati con nomi camelCase
    await queryInterface.addIndex('Transits', ['vehicleId'], { name: 'transits_vehicle_id_idx' });
    await queryInterface.addIndex('Transits', ['gateId'], { name: 'transits_gate_id_idx' });
    await queryInterface.addIndex('Transits', ['parkingId'], { name: 'transits_parking_id_idx' });
    await queryInterface.addIndex('Transits', ['dateTime'], { name: 'transits_date_time_idx' });

    // ===== 6. RATES =====
    await queryInterface.createTable('Rates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      parkingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Parkings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicleType: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      dayType: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      hourStart: {
        type: Sequelize.TIME,
        allowNull: false
      },
      hourEnd: {
        type: Sequelize.TIME,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Rates', ['parkingId'], { name: 'rates_parking_id_idx' });

    // ===== 7. INVOICES =====
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.UUID, // CAMBIATO IN UUID
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      // NOTA: Nomi colonne allineati al Model (camelCase)
      userId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parkingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Parkings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entryTransitId: {
        type: Sequelize.UUID, // CAMBIATO IN UUID
        allowNull: false,
        references: {
          model: 'Transits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      exitTransitId: {
        type: Sequelize.UUID, // CAMBIATO IN UUID
        allowNull: false,
        references: {
          model: 'Transits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.FLOAT, // ALLINEATO A FLOAT
        allowNull: false
      },
      status: { // CAMBIATO IN STATUS (Model)
        type: Sequelize.ENUM('paid', 'unpaid', 'expired'),
        allowNull: false,
        defaultValue: 'unpaid'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // Aggiungo paymentDate se serve (opzionale ma utile)
      // paymentDate: { type: Sequelize.DATE, allowNull: true },
      qrPath: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per Invoices aggiornati
    await queryInterface.addIndex('Invoices', ['userId'], { name: 'invoices_user_id_idx' });
    await queryInterface.addIndex('Invoices', ['parkingId'], { name: 'invoices_parking_id_idx' });
    await queryInterface.addIndex('Invoices', ['status'], { name: 'invoices_status_idx' });
    await queryInterface.addIndex('Invoices', ['dueDate'], { name: 'invoices_due_date_idx' });

    console.log('✅ All tables created successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Ordine corretto di drop (Foreign Keys prima)
    await queryInterface.dropTable('Invoices');
    await queryInterface.dropTable('Rates');
    await queryInterface.dropTable('Transits');
    await queryInterface.dropTable('Vehicles');
    await queryInterface.dropTable('Gates');
    await queryInterface.dropTable('Parkings');
    await queryInterface.dropTable('Users');

    // Pulizia ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Invoices_status";');

    console.log('✅ All tables dropped!');
  }
};
