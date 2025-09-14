import express from 'express';
import authUser from '../middelwares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, stripeWebhook } from '../controllers/orderController.js';
import authSeller from '../middelwares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod',authUser, placeOrderCOD );
orderRouter.get('/user',authUser, getUserOrders );
orderRouter.get('/seller',authSeller,getAllOrders);
orderRouter.post('/stripe',authUser, placeOrderStripe);
orderRouter.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);


export default orderRouter;