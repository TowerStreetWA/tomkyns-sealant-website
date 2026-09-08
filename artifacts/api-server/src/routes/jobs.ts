import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  CreateJobBody,
  CreateJobResponse,
  DeleteJobParams,
  ListJobsResponse,
  UpdateJobBody,
  UpdateJobParams,
  UpdateJobResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/jobs", requireAuth, async (_req, res): Promise<void> => {
  const jobs = await db
    .select()
    .from(jobsTable)
    .orderBy(desc(jobsTable.createdAt));
  res.json(ListJobsResponse.parse(jobs));
});

router.post("/jobs", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the job details" });
    return;
  }

  const [job] = await db
    .insert(jobsTable)
    .values({
      ...parsed.data,
      clientContact: parsed.data.clientContact || null,
      location: parsed.data.location || null,
      scheduledDate: parsed.data.scheduledDate
        ? parsed.data.scheduledDate.toISOString().slice(0, 10)
        : null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? "booked",
    })
    .returning();

  res.status(201).json(CreateJobResponse.parse(job));
});

router.patch("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  const body = UpdateJobBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid job update" });
    return;
  }

  const { scheduledDate, ...otherUpdates } = body.data;
  const update = {
    ...otherUpdates,
    ...(scheduledDate !== undefined
      ? {
          scheduledDate: scheduledDate
            ? scheduledDate.toISOString().slice(0, 10)
            : null,
        }
      : {}),
  };

  const [job] = await db
    .update(jobsTable)
    .set(update)
    .where(eq(jobsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(UpdateJobResponse.parse(job));
});

router.delete("/jobs/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid job" });
    return;
  }

  const [deleted] = await db
    .delete(jobsTable)
    .where(eq(jobsTable.id, params.data.id))
    .returning({ id: jobsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;