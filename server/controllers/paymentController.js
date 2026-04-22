import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class PaymentController {
    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    // @desc    Create Razorpay Order
    // @route   POST /api/payments/create-order
    async createOrder(req, res) {
        try {
            const { amount } = req.body;

            if (!amount || isNaN(amount)) {
                return res.status(400).json({ success: false, message: "Invalid amount" });
            }

            const options = {
                amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            };

            const order = await this.razorpay.orders.create(options);
            res.json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create payment order",
                error: error.message || error
            });
        }
    }

    // @desc    Verify Razorpay Payment
    // @route   POST /api/payments/verify-payment
    verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const body = razorpay_order_id + "|" + razorpay_payment_id;

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {
                res.json({ success: true, status: 'success', message: 'Payment verified successfully' });
            } else {
                res.status(400).json({ success: false, status: 'failure', message: 'Invalid signature' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

const paymentController = new PaymentController();

export const createOrder = paymentController.createOrder.bind(paymentController);
export const verifyPayment = paymentController.verifyPayment.bind(paymentController);

export default paymentController;
