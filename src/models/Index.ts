import { User } from "./User";
import { Vehicle } from "./Vehicle";
import { Parking } from "./Parking";
import { Rate } from "./Rate";
import { Gate } from "./Gate";
import { Transit } from "./Transit";
import { Invoice } from "./Invoice";

// Utente ha molti Veicoli (1:N)
User.hasMany(Vehicle, { foreignKey: "ownerId", as: "vehicles" });
Vehicle.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Utente ha molte Fatture (1:N)
User.hasMany(Invoice, { foreignKey: "userId", as: "invoices" });
Invoice.belongsTo(User, { foreignKey: "userId", as: "user" });

// Parcheggio ha molti Varchi (1:N)
Parking.hasMany(Gate, { foreignKey: "parkingId", as: "gates" });
Gate.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });

// Parcheggio ha molte Tariffe (1:N)
Parking.hasMany(Rate, { foreignKey: "parkingId", as: "tariffs" });
Rate.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });

// Parcheggio ha molti Transiti (1:N)
Parking.hasMany(Transit, { foreignKey: "parkingId", as: "transits" });
Transit.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });

// Parcheggio ha molte Fatture (1:N)
Parking.hasMany(Invoice, { foreignKey: "parkingId", as: "invoices" });
Invoice.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });

// Varco ha molti Transiti (1:N)
Gate.hasMany(Transit, { foreignKey: "gateId", as: "transits" });
Transit.belongsTo(Gate, { foreignKey: "gateId", as: "gate" });

// Veicolo ha molti Transiti (1:N)
Vehicle.hasMany(Transit, { foreignKey: "vehicleId", as: "transits" });
Transit.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

// Transito ha una Fattura (1:1)
Invoice.belongsTo(Transit, { foreignKey: "entryTransitId", as: "entryTransit" });
Invoice.belongsTo(Transit, { foreignKey: "exitTransitId", as: "exitTransit" });

export {
  User,
  Vehicle,
  Parking,
  Rate,
  Gate,
  Transit,
  Invoice,
};