const { signup, login, getUserStatus, updateUserStatus } = require('../controllers/auth.controller');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

jest.mock('../models/user.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, userId: 'mockUserId', headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    describe('signup', () => {
        it('should create a new user and return 201 status', async () => {
            validationResult.mockReturnValue({ isEmpty: () => true });
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.prototype.save = jest.fn().mockResolvedValue({ _id: 'mockUserId' });

            req.body = { email: 'admin1@test.com', password: '123456', name: 'User Test 1' };

            await signup(req, res, next);

            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 12);
            expect(User.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'User created!', userId: 'mockUserId' });
        });
    });

    describe('login', () => {
        it('should log in a user and return a token', async () => {
            User.findOne.mockResolvedValue({ email: 'admin1@test.com', password: 'hashedPassword', _id: 'mockUserId', isAdmin: false });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            req.body = { email: 'admin1@test.com', password: '123456' };

            await login(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'admin1@test.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { email: 'admin1@test.com', userId: 'mockUserId' },
                expect.any(String),
                { expiresIn: '1h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: 'mockToken',
                userId: 'mockUserId',
                email: 'admin1@test.com',
                isAdmin: false,
            });
        });
    });

    describe('getUserStatus', () => {
        it('should return the user status', async () => {
            User.findById.mockResolvedValue({ status: 'Active' });

            await getUserStatus(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('mockUserId');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ status: 'Active' });
        });
    });

    describe('updateUserStatus', () => {
        it('should update the user status and return 200 status', async () => {
            User.findById.mockResolvedValue({
                save: jest.fn().mockResolvedValue({ status: 'Updated status' }),
            });

            req.body = { status: 'Updated status' };

            await updateUserStatus(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('mockUserId');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User status updated' });
        });
    });
});