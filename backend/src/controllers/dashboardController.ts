import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, layout, isPublic } = req.body;

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description,
        layout,
        isPublic,
        userId: req.userId!
      }
    });

    res.status(201).json({
      status: 'success',
      data: { dashboard }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboards = await prisma.dashboard.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            visualization: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: { dashboards }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        items: {
          include: {
            visualization: {
              include: {
                query: {
                  include: {
                    connection: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!dashboard) {
      throw createError('Dashboard not found', 404);
    }

    res.json({
      status: 'success',
      data: { dashboard }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await prisma.dashboard.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      data: req.body
    });

    if (dashboard.count === 0) {
      throw createError('Dashboard not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Dashboard updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await prisma.dashboard.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (dashboard.count === 0) {
      throw createError('Dashboard not found', 404);
    }

    res.json({
      status: 'success',
      message: 'Dashboard deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
