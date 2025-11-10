import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createVisualization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, config, queryId } = req.body;

    const visualization = await prisma.visualization.create({
      data: {
        name,
        type,
        config,
        queryId
      }
    });

    res.status(201).json({
      status: 'success',
      data: { visualization }
    });
  } catch (error) {
    next(error);
  }
};

export const getVisualizations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visualizations = await prisma.visualization.findMany({
      where: {
        query: {
          userId: req.userId
        }
      },
      include: {
        query: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: { visualizations }
    });
  } catch (error) {
    next(error);
  }
};

export const getVisualization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visualization = await prisma.visualization.findFirst({
      where: {
        id: req.params.id,
        query: {
          userId: req.userId
        }
      },
      include: {
        query: {
          include: {
            connection: true
          }
        }
      }
    });

    if (!visualization) {
      throw createError('Visualization not found', 404);
    }

    res.json({
      status: 'success',
      data: { visualization }
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisualization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visualization = await prisma.visualization.findFirst({
      where: {
        id: req.params.id,
        query: {
          userId: req.userId
        }
      }
    });

    if (!visualization) {
      throw createError('Visualization not found', 404);
    }

    await prisma.visualization.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      status: 'success',
      message: 'Visualization updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVisualization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const visualization = await prisma.visualization.findFirst({
      where: {
        id: req.params.id,
        query: {
          userId: req.userId
        }
      }
    });

    if (!visualization) {
      throw createError('Visualization not found', 404);
    }

    await prisma.visualization.delete({
      where: { id: req.params.id }
    });

    res.json({
      status: 'success',
      message: 'Visualization deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
