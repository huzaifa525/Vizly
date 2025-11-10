import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { executeQueryOnDatabase } from '../services/databaseService';

export const createQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, sql, connectionId } = req.body;

    const query = await prisma.query.create({
      data: {
        name,
        description,
        sql,
        connectionId,
        userId: req.userId!
      }
    });

    res.status(201).json({
      status: 'success',
      data: { query }
    });
  } catch (error) {
    next(error);
  }
};

export const getQueries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const queries = await prisma.query.findMany({
      where: { userId: req.userId },
      include: {
        connection: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: { queries }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await prisma.query.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        connection: true
      }
    });

    if (!query) {
      throw createError('Query not found', 404);
    }

    res.json({
      status: 'success',
      data: { query }
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await prisma.query.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      data: req.body
    });

    if (query.count === 0) {
      throw createError('Query not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Query updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await prisma.query.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (query.count === 0) {
      throw createError('Query not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Query deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const executeQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await prisma.query.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        connection: true
      }
    });

    if (!query) {
      throw createError('Query not found', 404);
    }

    const result = await executeQueryOnDatabase(query.connection, query.sql);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
