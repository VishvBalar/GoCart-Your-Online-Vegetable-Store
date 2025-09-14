import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Stripe from "stripe";
import { response } from "express";
import User from "../models/User.js";

// Place Order COD : /api/order/cod

export const placeOrderCOD = async (req,res) => {
   try {
        const {items, address} = req.body;
        const userId = req.user.id; // Get userId from authenticated user

        if(!address || items.length === 0) {
            return res.status(400).json({success: false, message: "Invalid Data"});
        }

        // Calculate total amount using items

        let amount = await items.reduce( async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + (product.offerPrice * item.quantity);
        }, 0);

        // Add Tax Charge 

        amount += Math.floor(amount * 0.02);

        await Order.create({userId, items, amount, address, paymentType: "COD"});
        return res.status(201).json({success: true, message: "Order Placed Successfully"});
   } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
   }
}

// Place Order Online : /api/order/stripe

export const placeOrderStripe = async (req,res) => {
   try {
        console.log('Stripe order request received');
        const {items, address} = req.body;
        const userId = req.user.id; // Get userId from authenticated user

        const { origin } = req.headers;
        console.log('Request data:', { items: items?.length, address: !!address, userId, origin });

        if(!address || items.length === 0) {
            return res.status(400).json({success: false, message: "Invalid Data"});
        }

        // Check if Stripe is configured
        if(!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({success: false, message: "Stripe not configured"});
        }

        let productData = [];

        // Calculate total amount using items

        let amount = await items.reduce( async (acc, item) => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            return (await acc) + (product.offerPrice * item.quantity);
        }, 0);

        // Add Tax Charge 

        amount += Math.floor(amount * 0.02);

       const order = await Order.create({userId, items, amount, address, paymentType: "Online"});

         // Create Stripe Session
         
            const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

         // Create line items for Stripe session

            const line_items = productData.map((item) => {
                return {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: Math.floor(item.price * 100), // Convert to cents
                    },
                    quantity: item.quantity,
                }
            });

            // ceate a session

            const session = await stripeInstance.checkout.sessions.create({
                line_items,
                mode: 'payment',
                success_url: `${origin}/loader?next=my-orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderId: order._id.toString(),
                    userId,
                }
            });

        return res.status(201).json({success: true, url : session.url});
   } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
   }
}

// Stripe Webhook Handler : /api/order/webhook

export const stripeWebhook = async (req, res) => {
    try {
        // Check if Stripe is configured
        if(!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
            console.log('Stripe webhook not configured');
            return res.status(500).json({success: false, message: "Stripe webhook not configured"});
        }

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.log(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                const { orderId, userId } = session.data[0].metadata;

                // Update order status to paid

                await Order.findByIdAndUpdate(orderId, {isPaid: true});     

                // clear cart items

                await User.findByIdAndUpdate(userId, {cart: []});

                break;

                case 'payment_intent.payment_failed':{
                    const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                const { orderId } = session.data[0].metadata;

                await Order.findByIdAndDelete(orderId);
                break;


                }

            default:
                console.log(`Unhandled event type ${event.type}`);
                break;
        }
       response.json({received: true});
          

        res.json({received: true});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// Get Orders by User Id : /api/order/user

export const getUserOrders = async (req,res) => {
    try {
        const userId = req.user.id; // Get userId from authenticated user
        console.log('Fetching orders for userId:', userId);
        const orders = await Order.find({
            userId,
            $or: [
                {paymentType: "COD"}, // All COD orders
                {isPaid: true} // Any paid orders (online payments)
            ]
        }).populate("items.product address").sort({createdAt: -1});
        console.log('Found orders:', orders.length, orders.map(o => o._id));
        res.status(200).json({success: true, orders});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// Get All Orders (for seller / admin) : /api/order/seller

export const getAllOrders = async (req,res) => {
    try {
        const orders = await Order.find({
            $or: [
                {paymentType: "COD"}, // All COD orders
                {isPaid: true} // Any paid orders (online payments)
            ]
        }).populate("items.product address").sort({createdAt: -1});
        res.status(200).json({success: true, orders});
    } catch (error) {
         res.status(500).json({success: false, message: error.message});
    }
}