import axios from 'axios';

interface PaymentPayload {
  tenantPhone: string;     // Must start with 25261XXXXXXX
  amountUSD: number;       // All major local transactions settle in USD
  merchantUid: string;
  apiId: string;
  apiKey: string;
}

export class SomaliPaymentGateway {
  private static WAAFI_API_URL = 'https://api.waafipay.net/asm';

  /**
   * Dispatches a direct Merchant API request triggering a USSD push notification.
   */
  public async initiateMobilePayment(payload: PaymentPayload, transactionId: string): Promise<any> {
    const requestData = {
      schemaVersion: "1.0",
      requestId: transactionId,
      timestamp: Date.now().toString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: payload.merchantUid,
        apiId: payload.apiId,
        apiKey: payload.apiKey,
        paymentMethod: "MWALLET",
        payerInfo: {
          accountNo: payload.tenantPhone
        },
        transactionInfo: {
          referenceId: transactionId,
          invoiceId: transactionId.substring(0, 10),
          amount: payload.amountUSD.toString(),
          currency: "USD",
          description: "Rent Payment - GoobJoog System"
        }
      }
    };

    try {
      const response = await axios.post(SomaliPaymentGateway.WAAFI_API_URL, requestData, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { responseCode, responseMsg, params } = response.data;
      
      if (responseCode === "2001" && params && params.transactionId) {
        return {
          success: true,
          gatewayReference: params.transactionId,
          status: 'PENDING_PIN_ENTRY'
        };
      } else {
        return {
          success: false,
          error: responseMsg || 'Gateway initialization failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network interface error during payment initiation'
      };
    }
  }
}
