import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { config } from '../../config';

const JWT_SECRET = config.jwt.secret;
const MONGODB_URI = config.mongo.uri;

export class AuthManager {
    static async login(password: string): Promise<{ token: string }> {
        const client = new MongoClient(MONGODB_URI);

        try {
            await client.connect();
            const db = client.db();
            const usersCollection = db.collection('user_admin');

            const admin = await usersCollection.findOne({ username: 'aharon' });

            if (!admin) {
                throw new Error('Admin user not found');
            }

            const isValid = await bcrypt.compare(password, admin['passwordHash']);

            if (!isValid) {
                throw new Error('Invalid password');
            }

            await usersCollection.updateOne({ username: 'admin' }, { $set: { lastLogin: new Date() } });

            const token = jwt.sign(
                {
                    username: admin['username'],
                    role: admin['role'],
                    userId: admin._id,
                },
                JWT_SECRET,
                { expiresIn: '7d' },
            );

            return { token };
        } finally {
            await client.close();
        }
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error: any) {
            throw new Error('Invalid or expired token', error);
        }
    }
}
