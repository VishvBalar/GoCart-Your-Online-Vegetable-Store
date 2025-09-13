import Product from "../models/product.js";
import Order from "../models/Order.js";

// Place Order COD : /api/order/cod

export const placeOrderCOD = async (req,res) => {
   try {
        const {userId, items, address} = req.body;

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
        
        res.status(500).json({success: false, message: error.message});
   }
}

// Get Orders by User Id : /api/order/user

export const getUserOrders = async (req,res) => {
    try {
        const {userId} = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
    } catch (error) {
        
    }
}