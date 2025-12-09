export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}

export const processPayment = async (
    amount: number,
    paymentMethod: string
): Promise<PaymentResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate 90% success rate
            const isSuccess = Math.random() < 0.9;

            if (isSuccess) {
                resolve({
                    success: true,
                    transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
                });
            } else {
                resolve({
                    success: false,
                    error: 'Payment declined. Please try again.',
                });
            }
        }, 2000); // 2 second delay
    });
};
