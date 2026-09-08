import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, enquiriesTable, jobsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get(
  "/dashboard/summary",
  requireAuth,
  async (_req, res): Promise<void> => {
    const [enquiries, jobs] = await Promise.all([
      db
        .select()
        .from(enquiriesTable)
        .orderBy(desc(enquiriesTable.createdAt)),
      db.select().from(jobsTable),
    ]);

    res.json(
      GetDashboardSummaryResponse.parse({
        newEnquiries: enquiries.filter((item) => item.status === "new").length,
        activeJobs: jobs.filter((item) => item.status !== "complete").length,
        completedJobs: jobs.filter((item) => item.status === "complete").length,
        totalEnquiries: enquiries.length,
        recentEnquiries: enquiries.slice(0, 5),
      }),
    );
  },
);

export default router;