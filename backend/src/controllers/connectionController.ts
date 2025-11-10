import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { testDatabaseConnection } from '../services/databaseService';

export const createConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, host, port, database, username, password, ssl } = req.body;

    const connection = await prisma.connection.create({
      data: {
        name,
        type,
        host,
        port,
        database,
        username,
        password, // TODO: Encrypt in production
        ssl,
        userId: req.userId!
      }
    });

    res.status(201).json({
      status: 'success',
      data: { connection }
    });
  } catch (error) {
    next(error);
  }
};

export const getConnections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connections = await prisma.connection.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: { connections }
    });
  } catch (error) {
    next(error);
  }
};

export const getConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!connection) {
      throw createError('Connection not found', 404);
    }

    res.json({
      status: 'success',
      data: { connection }
    });
  } catch (error) {
    next(error);
  }
};

export const updateConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      data: req.body
    });

    if (connection.count === 0) {
      throw createError('Connection not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Connection updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (connection.count === 0) {
      throw createError('Connection not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const testConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!connection) {
      throw createError('Connection not found', 404);
    }

    const result = await testDatabaseConnection(connection);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
