import _ from 'lodash';

class HealthService {
  private data: Record<string, any> = {};

  private failedStatuses: Record<string, boolean> = {};

  getData() {
    return this.data;
  }

  isOk() {
    return _.keys(this.failedStatuses).length === 0;
  }

  updateData(key: string, status: boolean, value: any) {
    this.data[key] = value || status;
    if (status) {
      delete this.failedStatuses[key];
    } else {
      this.failedStatuses[key] = true;
    }
  }
}

const healthService = new HealthService();

export default healthService;
module.exports = healthService;
