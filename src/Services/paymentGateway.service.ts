import httpService from "./http.service";

export interface PublicPaymentConfig {
  schoolId: number;
  schoolName: string;
  currency: string;
  enabled: boolean;
  testMode: boolean;
  keyId: string;
  isDummyCredential: boolean;
  testModeNotice: string;
}

export interface PaymentOrderResponse {
  success: boolean;
  orderId: string;
  amount: number; // in paise
  amountInRupees: number;
  currency: string;
  keyId: string;
  testMode: boolean;
  isLiveApi: boolean;
  schoolId: number;
  schoolName: string;
  studentId: number;
  studentName: string;
  feeIds: number[];
  testModeNotice: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  studentId: number | string;
  feeIds: (number | string)[];
  remarks?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  testMode: boolean;
  receiptNumber: string;
  receiptId: number;
  totalAmount: number;
  monthsCovered: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  testModeNotice: string;
}

export interface SchoolPaymentCredentials {
  schoolId: number;
  schoolName: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayEnabled: boolean;
  razorpayTestMode: boolean;
  testModeNotice: string;
}

export const paymentGatewayService = {
  /**
   * Fetch school's public payment config (public Key ID, test mode status)
   */
  getPublicConfig: async (schoolId: string | number): Promise<PublicPaymentConfig> => {
    return httpService.get(`/api/payment-gateway/${schoolId}/config`);
  },

  /**
   * Create Razorpay order for fee items
   */
  createOrder: async (
    schoolId: string | number,
    payload: {
      studentId: string | number;
      feeIds: (string | number)[];
      amount?: number;
      notes?: Record<string, any>;
    }
  ): Promise<PaymentOrderResponse> => {
    return httpService.post(`/api/payment-gateway/${schoolId}/order`, payload);
  },

  /**
   * Verify signature and complete fee payment
   */
  verifyPayment: async (
    schoolId: string | number,
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    return httpService.post(`/api/payment-gateway/${schoolId}/verify`, payload);
  },

  /**
   * Admin credentials fetch
   */
  getCredentials: async (schoolId: string | number): Promise<SchoolPaymentCredentials> => {
    return httpService.get(`/api/payment-gateway/${schoolId}/credentials`);
  },

  /**
   * Admin credentials update
   */
  updateCredentials: async (
    schoolId: string | number,
    payload: {
      razorpayKeyId?: string;
      razorpayKeySecret?: string;
      razorpayEnabled?: boolean;
      razorpayTestMode?: boolean;
    }
  ): Promise<SchoolPaymentCredentials> => {
    return httpService.put(`/api/payment-gateway/${schoolId}/credentials`, payload);
  },
};

export default paymentGatewayService;
