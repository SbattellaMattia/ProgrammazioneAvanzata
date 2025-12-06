'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    await queryInterface.bulkInsert('utenti', [
      {
        id: 1,
        email: 'mario.rossi@email.com',
        password: await bcrypt.hash('password123', 10),
        nome: 'Mario',
        cognome: 'Rossi',
        token_residui: 100,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        email: 'giulia.bianchi@email.com',
        password: await bcrypt.hash('password123', 10),
        nome: 'Giulia',
        cognome: 'Bianchi',
        token_residui: 100,
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        email: 'luca.verdi@email.com',
        password: await bcrypt.hash('password123', 10),
        nome: 'Luca',
        cognome: 'Verdi',
        token_residui: 100,
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 2. PARCHEGGI =====
    await queryInterface.bulkInsert('parcheggi', [
      {
        id: 1,
        nome: 'Parcheggio Centro',
        indirizzo: 'Via Roma 15, Milano',
        posti_auto: 100,
        posti_moto: 20,
        posti_camion: 10,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        nome: 'Parcheggio Stazione',
        indirizzo: 'Piazza Garibaldi 3, Milano',
        posti_auto: 150,
        posti_moto: 30,
        posti_camion: 15,
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 3. VARCHI (3 per parcheggio) =====
    await queryInterface.bulkInsert('varchi', [
      // Parcheggio Centro
      {
        id: 1,
        parcheggio_id: 1,
        tipo: 'standard',
        direzione: 'ingresso',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        parcheggio_id: 1,
        tipo: 'standard',
        direzione: 'uscita',
        created_at: now,
        updated_at: now,
      },
      {
        id: 3,
        parcheggio_id: 1,
        tipo: 'smart',
        direzione: 'bidirezionale',
        created_at: now,
        updated_at: now,
      },
      // Parcheggio Stazione
      {
        id: 4,
        parcheggio_id: 2,
        tipo: 'smart',
        direzione: 'ingresso',
        created_at: now,
        updated_at: now,
      },
      {
        id: 5,
        parcheggio_id: 2,
        tipo: 'smart',
        direzione: 'uscita',
        created_at: now,
        updated_at: now,
      },
      {
        id: 6,
        parcheggio_id: 2,
        tipo: 'standard',
        direzione: 'bidirezionale',
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 4. VEICOLI =====
    await queryInterface.bulkInsert('veicoli', [
      {
        targa: 'AB123CD',
        tipo_veicolo: 'auto',
        proprietario_id: 1,
        created_at: now,
        updated_at: now,
      },
      {
        targa: 'EF456GH',
        tipo_veicolo: 'moto',
        proprietario_id: 2,
        created_at: now,
        updated_at: now,
      },
      {
        targa: 'IJ789KL',
        tipo_veicolo: 'auto',
        proprietario_id: 3,
        created_at: now,
        updated_at: now,
      },
      {
        targa: 'MN012OP',
        tipo_veicolo: 'camion',
        proprietario_id: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 5. TARIFFE =====
    await queryInterface.bulkInsert('tariffe', [
      // Parcheggio Centro - Auto
      {
        id: 1,
        parcheggio_id: 1,
        tipo_veicolo: 'auto',
        giorno: 'feriale',
        fascia_oraria_inizio: '08:00:00',
        fascia_oraria_fine: '20:00:00',
        tariffa_oraria: 2.50,
        tariffa_giornaliera: 15.00,
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        parcheggio_id: 1,
        tipo_veicolo: 'auto',
        giorno: 'feriale',
        fascia_oraria_inizio: '20:00:00',
        fascia_oraria_fine: '08:00:00',
        tariffa_oraria: 1.00,
        tariffa_giornaliera: 10.00,
        created_at: now,
        updated_at: now,
      },
      // Parcheggio Centro - Moto
      {
        id: 3,
        parcheggio_id: 1,
        tipo_veicolo: 'moto',
        giorno: 'tutti',
        fascia_oraria_inizio: '00:00:00',
        fascia_oraria_fine: '23:59:59',
        tariffa_oraria: 1.00,
        tariffa_giornaliera: 5.00,
        created_at: now,
        updated_at: now,
      },
      // Parcheggio Stazione - Auto
      {
        id: 4,
        parcheggio_id: 2,
        tipo_veicolo: 'auto',
        giorno: 'feriale',
        fascia_oraria_inizio: '06:00:00',
        fascia_oraria_fine: '22:00:00',
        tariffa_oraria: 3.00,
        tariffa_giornaliera: 20.00,
        created_at: now,
        updated_at: now,
      },
      // Parcheggio Stazione - Camion
      {
        id: 5,
        parcheggio_id: 2,
        tipo_veicolo: 'camion',
        giorno: 'tutti',
        fascia_oraria_inizio: '00:00:00',
        fascia_oraria_fine: '23:59:59',
        tariffa_oraria: 5.00,
        tariffa_giornaliera: 40.00,
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 6. TRANSITI (COERENTI) =====
    const ieri = new Date(now);
    ieri.setDate(ieri.getDate() - 1);
    ieri.setHours(10, 30, 0, 0);

    const ieriUscita = new Date(ieri);
    ieriUscita.setHours(14, 15, 0, 0);

    const oggi = new Date(now);
    oggi.setHours(9, 0, 0, 0);

    await queryInterface.bulkInsert('transiti', [
      // CASO 1: AB123CD - Ingresso + Uscita COMPLETATO (ieri) -> AVRÀ FATTURA
      {
        id: 1,
        veicolo_id: 'AB123CD',
        varco_id: 1,
        parcheggio_id: 1,
        tipo_transito: 'ingresso',
        data_ora: ieri,
        path_immagine: '/images/transiti/img001.jpg',
        targa_rilevata: 'AB123CD',
        created_at: now,
        updated_at: now,
      },
      {
        id: 2,
        veicolo_id: 'AB123CD',
        varco_id: 2,
        parcheggio_id: 1,
        tipo_transito: 'uscita',
        data_ora: ieriUscita,
        path_immagine: '/images/transiti/img002.jpg',
        targa_rilevata: 'AB123CD',
        created_at: now,
        updated_at: now,
      },
      // CASO 2: EF456GH - Solo INGRESSO (oggi) -> NON AVRÀ FATTURA
      {
        id: 3,
        veicolo_id: 'EF456GH',
        varco_id: 4,
        parcheggio_id: 2,
        tipo_transito: 'ingresso',
        data_ora: oggi,
        path_immagine: null,
        targa_rilevata: 'EF456GH',
        created_at: now,
        updated_at: now,
      },
      // CASO 3: IJ789KL - Ingresso + Uscita COMPLETATO (2 ore fa) -> AVRÀ FATTURA
      {
        id: 4,
        veicolo_id: 'IJ789KL',
        varco_id: 1,
        parcheggio_id: 1,
        tipo_transito: 'ingresso',
        data_ora: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 ore fa
        path_immagine: '/images/transiti/img003.jpg',
        targa_rilevata: 'IJ789KL',
        created_at: now,
        updated_at: now,
      },
      {
        id: 5,
        veicolo_id: 'IJ789KL',
        varco_id: 2,
        parcheggio_id: 1,
        tipo_transito: 'uscita',
        data_ora: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 ora fa
        path_immagine: '/images/transiti/img004.jpg',
        targa_rilevata: 'IJ789KL',
        created_at: now,
        updated_at: now,
      },
      // CASO 4: MN012OP - Solo INGRESSO (ieri) -> NON AVRÀ FATTURA (ancora dentro)
      {
        id: 6,
        veicolo_id: 'MN012OP',
        varco_id: 4,
        parcheggio_id: 2,
        tipo_transito: 'ingresso',
        data_ora: new Date(ieri.getTime() - 2 * 60 * 60 * 1000),
        path_immagine: null,
        targa_rilevata: 'MN012OP',
        created_at: now,
        updated_at: now,
      },
    ]);

    // ===== 7. FATTURE (SOLO PER TRANSITI COMPLETI) =====
    const scadenza1 = new Date(ieriUscita);
    scadenza1.setDate(scadenza1.getDate() + 1);

    const scadenza2 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    scadenza2.setDate(scadenza2.getDate() + 1);

    await queryInterface.bulkInsert('fatture', [
      // Fattura per AB123CD (transiti 1-2) - ~4 ore = 10.00€
      {
        id: 1,
        veicolo_id: 'AB123CD',
        parcheggio_id: 1,
        automobilista_id: 1,
        transito_ingresso_id: 1,
        transito_uscita_id: 2,
        importo: 10.00,
        stato_pagamento: 'pagata',
        data_scadenza: scadenza1,
        data_pagamento: ieriUscita,
        qr_code_path: '/invoices/qr_001.pdf',
        created_at: now,
        updated_at: now,
      },
      // Fattura per IJ789KL (transiti 4-5) - 2 ore = 5.00€
      {
        id: 2,
        veicolo_id: 'IJ789KL',
        parcheggio_id: 1,
        automobilista_id: 3,
        transito_ingresso_id: 4,
        transito_uscita_id: 5,
        importo: 5.00,
        stato_pagamento: 'non_pagata',
        data_scadenza: scadenza2,
        data_pagamento: null,
        qr_code_path: '/invoices/qr_002.pdf',
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeding completato con successo!');
    console.log('📊 Riepilogo:');
    console.log('   - 3 utenti');
    console.log('   - 2 parcheggi con 3 varchi ciascuno');
    console.log('   - 4 veicoli');
    console.log('   - 5 tariffe');
    console.log('   - 6 transiti (2 completi, 2 solo ingresso)');
    console.log('   - 2 fatture (solo per transiti completi)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('fatture', null, {});
    await queryInterface.bulkDelete('transiti', null, {});
    await queryInterface.bulkDelete('tariffe', null, {});
    await queryInterface.bulkDelete('veicoli', null, {});
    await queryInterface.bulkDelete('varchi', null, {});
    await queryInterface.bulkDelete('parcheggi', null, {});
    await queryInterface.bulkDelete('utenti', null, {});
    
    console.log('✅ Rollback completato!');
  }
};
