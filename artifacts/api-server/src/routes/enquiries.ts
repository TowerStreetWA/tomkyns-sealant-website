import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, enquiriesTable } from "@workspace/db";
import {
  CreateEnquiryBody,
  CreateEnquiryResponse,
  DeleteEnquiryParams,
  ListEnquiriesResponse,
  UpdateEnquiryBody,
  UpdateEnquiryParams,
  UpdateEnquiryResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/enquiries", requireAuth, async (req, res): Promise<void> => {
  const enquiries = await db
    .select()
    .from(enquiriesTable)
    .orderBy(desc(enquiriesTable.createdAt));
  res.json(ListEnquiriesResponse.parse(enquiries));
});

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid enquiry");
    res.status(400).json({ error: "Please check the enquiry details" });
    return;
  }

  const [enquiry] = await db
    .insert(enquiriesTable)
    .values({
      ...parsed.data,
      email: parsed.data.email || null,
      postcode: parsed.data.postcode || null,
      details: parsed.data.details || null,
      status: "new",
    })
    .returning();

  res.status(201).json(CreateEnquiryResponse.parse(enquiry));
});

router.patch(
  "/enquiries/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateEnquiryParams.safeParse(req.params);
    const body = UpdateEnquiryBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid enquiry update" });
      return;
    }

    const [enquiry] = await db
      .update(enquiriesTable)
      .set(body.data)
      .where(eq(enquiriesTable.id, params.data.id))
      .returning();

    if (!enquiry) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.json(UpdateEnquiryResponse.parse(enquiry));
  },
);

router.delete(
  "/enquiries/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteEnquiryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid enquiry" });
      return;
    }

    const [deleted] = await db
      .delete(enquiriesTable)
      .where(eq(enquiriesTable.id, params.data.id))
      .returning({ id: enquiriesTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;