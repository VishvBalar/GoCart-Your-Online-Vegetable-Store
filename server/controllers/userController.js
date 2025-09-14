import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; 

// Register User : api/user/register

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json( {success: false, message: "All fields are required"});
        }

        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({name, email, password: hashedPassword});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7*24*60*60*1000
        });

        return res.status(201).json({success: true, user: {email: user.email, name: user.name}, token});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// Login User : api/user/login

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({success: false, message: "All fields are required"});
        }

        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).json({success: false, message: "User does not exist"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000,
            path: '/',

        });

        return res.status(201).json({success: true, user: {email: user.email, name: user.name}, token});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// check auth status : api/user/is-auth

export const isAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.status(200).json({success: true, user});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

// Logout User : api/user/logout

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({success: true, message: "Logged out successfully"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: error.message});
    }
}