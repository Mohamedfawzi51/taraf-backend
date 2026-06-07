import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import { getValidated } from "../../utils/validated";

export class AdminController {
  stats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await adminService.getStats() });
    } catch (e) {
      next(e);
    }
  };

  orders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await adminService.listOrders(getValidated(req, "query")));
    } catch (e) {
      next(e);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const { status } = getValidated<{ status: string }>(req, "body");
      const data = await adminService.updateOrderStatus(id, status);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  products = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getValidated<{ page: number; limit: number }>(
        req,
        "query"
      );
      res.json(await adminService.listProducts(page, limit));
    } catch (e) {
      next(e);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const data = await adminService.createProduct(getValidated(req, "body"), files);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      const data = await adminService.updateProduct(
        id,
        getValidated(req, "body")
      );
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = getValidated<{ id: string }>(req, "params");
      await adminService.softDeleteProduct(id);
      res.json({ data: { message: "Product deleted" } });
    } catch (e) {
      next(e);
    }
  };

  inventory = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await adminService.getInventory() });
    } catch (e) {
      next(e);
    }
  };

  customers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getValidated<{ page: number; limit: number }>(
        req,
        "query"
      );
      res.json(await adminService.listCustomers(page, limit));
    } catch (e) {
      next(e);
    }
  };

  exportReport = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await adminService.exportReport();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=sales-report.csv");
      res.send(csv);
    } catch (e) {
      next(e);
    }
  };
}

export const adminController = new AdminController();
