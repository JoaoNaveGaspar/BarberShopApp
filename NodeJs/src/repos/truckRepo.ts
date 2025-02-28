import { Service, Inject } from 'typedi';

import ITruckRepo from "../services/IRepos/ITruckRepo";
import { Truck } from "../domain/truck";
import { TruckId } from "../domain/truckId";
import { TruckMap } from "../mappers/TruckMap";

import { Document, FilterQuery, Model } from 'mongoose';
import { ITruckPersistence } from '../dataschema/ITruckPersistence';
import ITruckDTO from '../dto/ITruckDTO';

@Service()
export default class TruckRepo implements ITruckRepo {
  private models: any;

  constructor(
    @Inject('truckSchema') private truckSchema: Model<ITruckPersistence & Document>,
  ) { }

  private createBaseQuery(): any {
    return {
      where: {},
    }
  }

  public async exists(truck: Truck): Promise<boolean> {

    const idX = truck.id instanceof TruckId ? (<TruckId>truck.id).toValue() : truck.id;

    const query = { domainId: idX };
    const truckDocument = await this.truckSchema.findOne(query as FilterQuery<ITruckPersistence & Document>);

    return !!truckDocument === true;
  }

  public async save(truck: Truck): Promise<Truck> {
    const query = { domainId: truck.id.toString() };

    const truckDocument = await this.truckSchema.findOne(query);

    try {
      if (truckDocument === null) {
        const rawTruck: any = TruckMap.toPersistence(truck);

        console.log(rawTruck);
        const truckCreated = await this.truckSchema.create(rawTruck);

        return TruckMap.toDomain(truckCreated);
      } else {
        truckDocument.tare = truck.tare;
        truckDocument.maxWeight = truck.maxWeight;
        truckDocument.batteryCapacity = truck.batteryCapacity;
        truckDocument.truckAutonomy = truck.truckAutonomy;
        truckDocument.chargeTime = truck.chargeTime;
        truckDocument.active = truck.active;
        await truckDocument.save();

        return truck;
      }
    } catch (err) {
      throw err;
    }
  }

  public async findByDomainId(truckId: TruckId | string): Promise<Truck> {
    const query = { domainId: truckId };
    const truckRecord = await this.truckSchema.findOne(query as FilterQuery<ITruckPersistence & Document>);

    if (truckRecord != null) {
      return TruckMap.toDomain(truckRecord);
    }
    else
      return null;
  }

  public async removeByTruckId(truckId: string | TruckId): Promise<Truck> {
    const query = { domainId: truckId };
    const deletedTruckRecord = await this.truckSchema.deleteOne(query as FilterQuery<ITruckPersistence & Document>);

    if (deletedTruckRecord != null) {
      return TruckMap.toDomain(deletedTruckRecord);
    }
    else
      return null;
  }

  public async findAll(): Promise<Truck[]> {
    const truckRecord = await this.truckSchema.find();

    if (truckRecord != null) {
      var trucksArray: Array<Truck> = [];
      for (var i = 0; i < truckRecord.length; i++) {
        trucksArray.push(TruckMap.toDomain(truckRecord[i]));
      }
      return trucksArray;
    }
    else
      return null;
  }

  public async findAllActivity(active: boolean): Promise<Truck[]> {
    const query = { active: active };
    const truckRecord = await this.truckSchema.find(query as FilterQuery<ITruckPersistence & Document>);

    if (truckRecord != null) {
      var trucksArray: Array<Truck> = [];
      for (var i = 0; i < truckRecord.length; i++) {
        trucksArray.push(TruckMap.toDomain(truckRecord[i]));
      }
      return trucksArray;
    }
    else
      return null;
  }
}