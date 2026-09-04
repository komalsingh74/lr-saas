import mongoose from 'mongoose';
import { User } from './models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lr-saas');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists:', existingSuperAdmin.email);
            return;
        }

        // Create super admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@lr-saas.com',
            phone: '9999999999',
            password: hashedPassword,
            role: 'superAdmin',
            isActive: true
        });

        console.log('Super admin created successfully!');
        console.log('Email: admin@lr-saas.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();