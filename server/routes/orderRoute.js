import express from 'express';
import authUser from '../middelwares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD } from '../controllers/orderController.js';
import authSeller from '../middelwares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod',authUser, placeOrderCOD );
orderRouter.get('/user',authUser, getUserOrders );
orderRouter.get('/seller',authSeller,getAllOrders);

export default orderRouter;