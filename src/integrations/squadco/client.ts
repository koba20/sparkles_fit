import axios from 'axios';

// Squadco Configuration
export const SQUADCO_CONFIG = {
    publicKey: 'pk_4a585a048765644754d77cb3c9a8b104596d641f',
    secretKey: 'sk_4a585a048765644751d07ba3a7a0c26f3c720d12',
    businessName: 'XIVTTW',
    businessEmail: 'iwokemmanuel49@gmail.com',
    businessPhone: '+2349019962712',
    currency: 'NGN',
    environment: 'live', // or 'sandbox' for testing
    redirectUrl: 'http://localhost:8080/order-confirmation',
    webhookUrl: '', // Leave empty for now
};

// Squadco API endpoints
const SQUADCO_API = {
    live: 'https://api.squadco.com',
    sandbox: 'https://api.squadco.com', // Replace with actual sandbox URL if different
};

export interface SquadcoPaymentData {
    amount: number;
    email: string;
    currency?: string;
    reference: string;
    callback_url?: string;
    metadata?: {
        order_id: string;
        customer_name: string;
        items: any[];
    };
}

export interface SquadcoPaymentResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        authorization_url: string;
        reference: string;
        access_code: string;
    };
}

export interface SquadcoVerificationResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        metadata: any;
        amount: number;
        currency: string;
        reference: string;
        status: 'success' | 'failed' | 'pending';
        gateway_response: string;
        paid_at: string;
        created_at: string;
    };
}

class SquadcoClient {
    private baseURL: string;
    private secretKey: string;

    constructor() {
        this.baseURL = SQUADCO_API[SQUADCO_CONFIG.environment as keyof typeof SQUADCO_API];
        this.secretKey = SQUADCO_CONFIG.secretKey;
    }

    // Initialize payment
    async initializePayment(paymentData: SquadcoPaymentData): Promise<SquadcoPaymentResponse> {
        try {
            console.log('Initializing payment with data:', {
                ...paymentData,
                // Don't log sensitive data
                email: paymentData.email ? '***@***' : undefined,
            });
            
            const payload = {
                amount: Math.round(paymentData.amount * 100), // Convert to kobo (smallest currency unit) and ensure it's an integer
                email: paymentData.email,
                currency: paymentData.currency || SQUADCO_CONFIG.currency,
                reference: paymentData.reference,
                callback_url: paymentData.callback_url || SQUADCO_CONFIG.redirectUrl,
                metadata: JSON.stringify(paymentData.metadata), // Ensure metadata is properly stringified
                initiate_type: 'inline', // Required parameter according to Squadco docs
            };

            console.log('Sending payment request to Squadco with payload:', {
                ...payload,
                email: '***@***', // Don't log actual email
            });

            const response = await axios.post(
                `${this.baseURL}/transaction/initialize`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Squadco initialization response:', response.data);

            if (!response.data || !response.data.data || !response.data.data.checkout_url) {
                console.error('Invalid response format from Squadco:', response.data);
                return {
                    status: 'error',
                    message: 'Invalid response from payment gateway',
                };
            }

            return {
                status: 'success',
                message: 'Payment initialized successfully',
                data: {
                    authorization_url: response.data.data.checkout_url,
                    reference: response.data.data.transaction_ref || paymentData.reference,
                    access_code: response.data.data.access_token || '',
                },
            };
        } catch (error: any) {
            console.error('Squadco payment initialization error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to initialize payment',
            };
        }
    }

    // Verify payment
    async verifyPayment(reference: string): Promise<SquadcoVerificationResponse> {
        try {
            console.log('Verifying payment with reference:', reference);
            const response = await axios.get(
                `${this.baseURL}/transaction/verify/${reference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                    },
                }
            );

            console.log('Squadco verification response:', response.data);
            
            // Check if the response has the expected structure
            if (!response.data || !response.data.data) {
                console.error('Unexpected response structure from Squadco:', response.data);
                return {
                    status: 'error',
                    message: 'Invalid response from payment gateway',
                };
            }

            return {
                status: 'success',
                message: 'Payment verified successfully',
                data: response.data.data,
            };
        } catch (error: any) {
            console.error('Squadco payment verification error:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            
            return {
                status: 'error',
                message: error.response?.data?.message || 'Failed to verify payment',
            };
        }
    }

    // Generate unique reference
    generateReference(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `BLVCK_${timestamp}_${random}`.toUpperCase();
    }

    // Format amount for display
    formatAmount(amount: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    }
}

export const squadcoClient = new SquadcoClient();