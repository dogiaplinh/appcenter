import { ActiveDeviceCounts, AppItem, CountsResult, EventsResult, User } from "../models/ApiModels";
import qs from "qs";
import moment from "moment";
import { Constants } from "../assets";

export type SearchCommonOptions = {
  start: Date;
  end?: Date;
  limit?: number;
  offset?: number;
};
class ApiClient {
  private apiToken: string;

  setToken(token: string) {
    this.apiToken = token;
  }

  get token() {
    return this.apiToken;
  }

  private getQueryParams(options: SearchCommonOptions) {
    return {
      start: moment(options.start).format(),
      end: options.end && moment(options.end).format(),
      $top: options.limit || Constants.DEFAULT_MAX_RESULTS,
      $skip: options.offset || 0,
    };
  }

  private async callApi<T = any>(
    url: string,
    queryString?: Record<string, string | number>,
  ): Promise<T> {
    const q = queryString ? "?" + qs.stringify(queryString, { skipNulls: true }) : "";
    const response = await fetch(url + q, {
      headers: {
        ["X-API-Token"]: this.apiToken,
      },
    });
    if (response.status === 200) return await response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.callApi<User>("https://api.appcenter.ms/v0.1/user");
  }

  async getApps(): Promise<AppItem[]> {
    return this.callApi<AppItem[]>("https://api.appcenter.ms/v0.1/apps");
  }

  async getVersions(
    username: string,
    appName: string,
    options: SearchCommonOptions,
  ): Promise<CountsResult> {
    const result = await this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/versions`,
      this.getQueryParams(options),
    );
    return {
      type: "version",
      total: result.total,
      values: result.versions.map((x) => ({
        count: x.count,
        previousCount: x.previous_count,
        key: x.version,
      })),
    };
  }

  async getActiveDeviceCounts(username: string, appName: string, options: SearchCommonOptions) {
    return this.callApi<ActiveDeviceCounts>(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/active_device_counts`,
      this.getQueryParams(options),
    );
  }

  async getModels(
    username: string,
    appName: string,
    options: SearchCommonOptions,
  ): Promise<CountsResult> {
    const result = await this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/models`,
      this.getQueryParams(options),
    );
    return {
      type: "model",
      total: result.total,
      values: result.models.map((x) => ({
        count: x.count,
        previousCount: x.previous_count,
        key: x.model_name,
      })),
    };
  }

  async getOSes(
    username: string,
    appName: string,
    options: SearchCommonOptions,
  ): Promise<CountsResult> {
    const result = await this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/oses`,
      this.getQueryParams(options),
    );
    return {
      type: "os",
      total: result.total,
      values: result.oses.map((x) => ({
        count: x.count,
        previousCount: x.previous_count,
        key: x.os_name,
      })),
    };
  }

  async getLanguages(
    username: string,
    appName: string,
    options: SearchCommonOptions,
  ): Promise<CountsResult> {
    const result = await this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/languages`,
      this.getQueryParams(options),
    );
    return {
      type: "language",
      total: result.total,
      values: result.languages.map((x) => ({
        count: x.count,
        previousCount: x.previous_count,
        key: x.language_name,
      })),
    };
  }

  async getPlaces(
    username: string,
    appName: string,
    options: SearchCommonOptions,
  ): Promise<CountsResult> {
    const result = await this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/places`,
      this.getQueryParams(options),
    );
    return {
      type: "place",
      total: result.total,
      values: result.places.map((x) => ({
        count: x.count,
        previousCount: x.previous_count,
        key: x.code,
      })),
    };
  }

  async getEventsSummary(username: string, appName: string, options: SearchCommonOptions) {
    return this.callApi<EventsResult>(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/events`,
      this.getQueryParams(options),
    );
  }

  async getEventDeviceCount(
    username: string,
    appName: string,
    eventName: string,
    options: SearchCommonOptions,
  ) {
    return this.callApi(
      `https://api.appcenter.ms/v0.1/apps/${username}/${appName}/analytics/events/${eventName}/device_count`,
      this.getQueryParams(options),
    );
  }
}

const apiClient = new ApiClient();
export default apiClient;
