import axios, { AxiosInstance, isAxiosError } from "axios";
import crypto from "crypto";
import "dotenv/config";
import { DigiFlazzPriceListParams, DigiFlazzPriceListResponse } from "./type";

export class DigiFlazzService {
  private readonly BASE_URL = "https://api.digiflazz.com/v1";
  private readonly apiKey: string;
  private readonly username: string;

  private readonly apiClient: AxiosInstance;

  constructor() {
    if (!process.env.DIGIFLAZZ_API_KEY || !process.env.DIGIFLAZZ_USERNAME) {
      throw new Error(
        "DIGIFLAZZ_API_KEY and DIGIFLAZZ_USERNAME must be set in environment variables."
      );
    }
    this.apiKey = process.env.DIGIFLAZZ_API_KEY;
    this.username = process.env.DIGIFLAZZ_USERNAME;

    this.apiClient = axios.create({
      baseURL: this.BASE_URL,
    });
  }

  private generateSignature(value: string) {
    return crypto
      .createHash("md5")
      .update(this.username + this.apiKey + value)
      .digest("hex");
  }

  public async getPriceList(data: DigiFlazzPriceListParams) {
    try {
      const sign = this.generateSignature("pricelist");

      const response = await this.apiClient.post<DigiFlazzPriceListResponse>(
        "/price-list",
        {
          cmd: data.cmd,
          username: this.username,
          code: data.code,
          category: data.category,
          brand: data.brand,
          type: data.type,
          sign: sign,
        }
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          `DigiFlazz API error: ${error.response?.data?.message}`
        );
      }

      throw new Error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
