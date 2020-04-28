import { Service, ServiceBroker, ServiceSchema } from 'moleculer';
import { App, IMoleculerService } from '../../../domains/app';

type MoleculesMap = Record<string, Service>;

export class MoleculerService implements IMoleculerService {
  private broker?: ServiceBroker;

  private moleculeServices: ServiceSchema[] = [];

  private molecules: MoleculesMap = {};

  async init(app: App) {
    app.registerProvider('moleculerService', this);
    const { isTest } = app.config;
    const { moleculerBroker, molecules } = app;
    this.broker = moleculerBroker;
    this.moleculeServices = molecules.map((moleculeFactory) => moleculeFactory(app));
    if (!isTest) {
      await this.startBrokerWithServices();
    }
  }

  private async startBrokerWithServices(serviceNames?: string[]) {
    if (!this.broker) {
      throw new Error('No broker defined');
    }
    const broker = this.broker as ServiceBroker;
    const moleculeServices = serviceNames
      ? this.moleculeServices.filter(({ name }) => serviceNames.includes(name))
      : this.moleculeServices;
    const services = await Promise.all(
      moleculeServices.map((moleculeService) => broker.createService(moleculeService)),
    );
    this.molecules = services.reduce((result, service) => {
      result[service.name] = service;
      return result;
    }, {} as MoleculesMap);
    return broker.start();
  }

  async stopBroker() {
    if (!this.broker) {
      throw new Error('No broker defined');
    }
    const broker = this.broker as ServiceBroker;
    await Promise.all(
      (<Service[]>broker.services).map((service) => broker.destroyService(service)),
    );
    return broker.stop();
  }
}

export default new MoleculerService();
