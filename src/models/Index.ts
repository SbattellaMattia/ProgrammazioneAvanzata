import { User } from "./User";
import { Vehicle } from "./Vehicle";
import { Parking } from "./Parking";
import { Tariffa } from "./Tariff";
import { Gate } from "./Gate";
import { Transit } from "./Transit";
import { Invoice } from "./Invoice";


User.hasMany(Vehicle, { foreignKey: "ownerId", as: "vehicles" });
Vehicle.belongsTo(User, { foreignKey: "ownerId", as: "owner" });


User.hasMany(Invoice, { foreignKey: "userId", as: "invoices" });
Invoice.belongsTo(User, { foreignKey: "userId", as: "user" });


Parking.hasMany(Gate, { foreignKey: "parkingId", as: "gates" });
Gate.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });


Parking.hasMany(Tariffa, { foreignKey: "parkingId", as: "tariffs" });
Tariffa.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });


Parking.hasMany(Transit, { foreignKey: "parkingId", as: "transits" });
Transit.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });


Parking.hasMany(Invoice, { foreignKey: "parkingId", as: "invoices" });
Invoice.belongsTo(Parking, { foreignKey: "parkingId", as: "parking" });


Gate.hasMany(Transit, { foreignKey: "gateId", as: "transits" });
Transit.belongsTo(Gate, { foreignKey: "gateId", as: "gate" });


Vehicle.hasMany(Transit, { foreignKey: "vehicleId", as: "transits" });
Transit.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });


Invoice.belongsTo(Transit, { foreignKey: "entryTransitId", as: "entryTransit" });


Invoice.belongsTo(Transit, { foreignKey: "exitTransitId", as: "exitTransit" });

export {
  User,
  Vehicle,
  Parking,
  Tariffa,
  Gate,
  Transit,
  Invoice,
};