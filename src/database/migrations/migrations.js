'use strict';

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

    // Indexes for users
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    // ===== 2. PARKING LOTS =====
    await queryInterface.createTable('Parking', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      car_spots: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      motorcycle_spots: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      truck_spots: {
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
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      parking_lot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parking',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'standard, smart'
      },
      direction: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'entrance, exit, bidirectional'
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

    // Indexes for gates
    await queryInterface.addIndex('Gates', ['parking_lot_id'], {
      name: 'gates_parking_lot_id_idx'
    });

    // ===== 4. VEHICLES (with license plate as PK) =====
    await queryInterface.createTable('Vehicles', {
      license_plate: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      vehicle_type: {
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

    // Indexes for vehicles
    await queryInterface.addIndex('Vehicles', ['owner_id'], {
      name: 'vehicles_owner_id_idx'
    });

    // ===== 5. TRANSITS =====
    await queryInterface.createTable('Transits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      vehicle_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'license_plate'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gate_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Gates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parking_lot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parking',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transit_type: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'entrance, exit'
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      image_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'License plate image path for standard gates'
      },
      detected_license_plate: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'The detected license plate may not match the actual license plate'
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

    // Indexes for transits
    await queryInterface.addIndex('Transits', ['vehicle_id'], {
      name: 'transits_vehicle_id_idx'
    });
    await queryInterface.addIndex('Transits', ['gate_id'], {
      name: 'transits_gate_id_idx'
    });
    await queryInterface.addIndex('Transits', ['parking_lot_id'], {
      name: 'transits_parking_lot_id_idx'
    });
    await queryInterface.addIndex('Transits', ['date_time'], {
      name: 'transits_date_time_idx'
    });
    await queryInterface.addIndex('Transits', ['vehicle_id', 'date_time'], {
      name: 'transits_vehicle_date_idx'
    });

    // ===== 6. RATES =====
    await queryInterface.createTable('Rates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      parking_lot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parking',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicle_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'car, motorcycle, truck'
      },
      day: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'weekday, holiday, all'
      },
      time_slot_start: {
        type: Sequelize.TIME,
        allowNull: false
      },
      time_slot_end: {
        type: Sequelize.TIME,
        allowNull: false
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Euro per hour'
      },
      daily_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Maximum daily rate'
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

    // Indexes for rates
    await queryInterface.addIndex('Rates', ['parking_lot_id'], {
      name: 'rates_parking_lot_id_idx'
    });

    // ===== 7. INVOICES =====
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      vehicle_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'license_plate'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parking_lot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Parking',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entrance_transit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Transits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      exit_transit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Transits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'unpaid',
        comment: 'unpaid, paid, overdue'
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Exit + 1 day'
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      qr_code_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'QR code PDF file path'
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

    // Indexes for invoices
    await queryInterface.addIndex('Invoices', ['vehicle_id'], {
      name: 'invoices_vehicle_id_idx'
    });
    await queryInterface.addIndex('Invoices', ['driver_id'], {
      name: 'invoices_driver_id_idx'
    });
    await queryInterface.addIndex('Invoices', ['parking_lot_id'], {
      name: 'invoices_parking_lot_id_idx'
    });
    await queryInterface.addIndex('Invoices', ['payment_status'], {
      name: 'invoices_payment_status_idx'
    });
    await queryInterface.addIndex('Invoices', ['due_date'], {
      name: 'invoices_due_date_idx'
    });
    await queryInterface.addIndex('Invoices', ['driver_id', 'payment_status'], {
      name: 'invoices_driver_status_idx'
    });

    console.log('✅ All tables created successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse order to respect foreign keys
    await queryInterface.dropTable('Invoices');
    await queryInterface.dropTable('Rates');
    await queryInterface.dropTable('Transits');
    await queryInterface.dropTable('Vehicles');
    await queryInterface.dropTable('Gates');
    await queryInterface.dropTable('Parking');
    await queryInterface.dropTable('Users');
    
    // Drop ENUM type for role
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
    
    console.log('✅ All tables dropped!');
  }
};
