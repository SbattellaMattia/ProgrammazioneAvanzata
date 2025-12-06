'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    // ===== 1. UTENTI =====
    await queryInterface.createTable('utenti', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      nome: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cognome: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      token_residui: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per utenti
    await queryInterface.addIndex('utenti', ['email'], {
      unique: true,
      name: 'utenti_email_unique'
    });

    // ===== 2. PARCHEGGI =====
    await queryInterface.createTable('parcheggi', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      indirizzo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      posti_auto: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      posti_moto: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      posti_camion: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ===== 3. VARCHI =====
    await queryInterface.createTable('varchi', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      parcheggio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parcheggi',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'standard, smart'
      },
      direzione: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'ingresso, uscita, bidirezionale'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per varchi
    await queryInterface.addIndex('varchi', ['parcheggio_id'], {
      name: 'varchi_parcheggio_id_idx'
    });

    // ===== 4. VEICOLI (con targa come PK) =====
    await queryInterface.createTable('veicoli', {
      targa: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      tipo_veicolo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'auto, moto, camion'
      },
      proprietario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'utenti',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per veicoli
    await queryInterface.addIndex('veicoli', ['proprietario_id'], {
      name: 'veicoli_proprietario_id_idx'
    });

    // ===== 5. TRANSITI =====
    await queryInterface.createTable('transiti', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      veicolo_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'veicoli',
          key: 'targa'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      varco_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'varchi',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parcheggio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parcheggi',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_transito: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'ingresso, uscita'
      },
      data_ora: {
        type: Sequelize.DATE,
        allowNull: false
      },
      path_immagine: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Path immagine targa per varchi standard'
      },
      targa_rilevata: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'La targa rilevata può non coincidere con la targa vera'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per transiti
    await queryInterface.addIndex('transiti', ['veicolo_id'], {
      name: 'transiti_veicolo_id_idx'
    });
    await queryInterface.addIndex('transiti', ['varco_id'], {
      name: 'transiti_varco_id_idx'
    });
    await queryInterface.addIndex('transiti', ['parcheggio_id'], {
      name: 'transiti_parcheggio_id_idx'
    });
    await queryInterface.addIndex('transiti', ['data_ora'], {
      name: 'transiti_data_ora_idx'
    });
    await queryInterface.addIndex('transiti', ['veicolo_id', 'data_ora'], {
      name: 'transiti_veicolo_data_idx'
    });

    // ===== 6. TARIFFE =====
    await queryInterface.createTable('tariffe', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      parcheggio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parcheggi',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_veicolo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'auto, moto, camion'
      },
      giorno: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'feriale, festivo, tutti'
      },
      fascia_oraria_inizio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      fascia_oraria_fine: {
        type: Sequelize.TIME,
        allowNull: false
      },
      tariffa_oraria: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Euro per ora'
      },
      tariffa_giornaliera: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Tariffa massima giornaliera'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per tariffe
    await queryInterface.addIndex('tariffe', ['parcheggio_id'], {
      name: 'tariffe_parcheggio_id_idx'
    });

    // ===== 7. FATTURE =====
    await queryInterface.createTable('fatture', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      veicolo_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'veicoli',
          key: 'targa'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      parcheggio_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'parcheggi',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      automobilista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utenti',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transito_ingresso_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'transiti',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transito_uscita_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'transiti',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      importo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stato_pagamento: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'non_pagata',
        comment: 'non_pagata, pagata, scaduta'
      },
      data_scadenza: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Uscita + 1 giorno'
      },
      data_pagamento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      qr_code_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Path del PDF con QR code'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indici per fatture
    await queryInterface.addIndex('fatture', ['veicolo_id'], {
      name: 'fatture_veicolo_id_idx'
    });
    await queryInterface.addIndex('fatture', ['automobilista_id'], {
      name: 'fatture_automobilista_id_idx'
    });
    await queryInterface.addIndex('fatture', ['parcheggio_id'], {
      name: 'fatture_parcheggio_id_idx'
    });
    await queryInterface.addIndex('fatture', ['stato_pagamento'], {
      name: 'fatture_stato_pagamento_idx'
    });
    await queryInterface.addIndex('fatture', ['data_scadenza'], {
      name: 'fatture_data_scadenza_idx'
    });
    await queryInterface.addIndex('fatture', ['automobilista_id', 'stato_pagamento'], {
      name: 'fatture_automobilista_stato_idx'
    });

    console.log('✅ Tutte le tabelle create con successo!');
  },

  down: async (queryInterface, Sequelize) => {
    // Ordine inverso per rispettare le foreign key
    await queryInterface.dropTable('fatture');
    await queryInterface.dropTable('tariffe');
    await queryInterface.dropTable('transiti');
    await queryInterface.dropTable('veicoli');
    await queryInterface.dropTable('varchi');
    await queryInterface.dropTable('parcheggi');
    await queryInterface.dropTable('utenti');
    
    console.log('✅ Tutte le tabelle eliminate!');
  }
};
