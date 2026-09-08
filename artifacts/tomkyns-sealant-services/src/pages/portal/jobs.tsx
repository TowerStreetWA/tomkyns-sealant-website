import { useState } from "react";
import { useListJobs, useCreateJob, useUpdateJob, useDeleteJob, getListJobsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Ensure day-picker styles are loaded if not included via tw
// Wait, react-day-picker css is standard but shadcn includes Calendar which wraps it. I'll use the shadcn Calendar if needed, but since I'm just building a native date input or simple form I'll use standard inputs to be safe. HTML date input is fine for admin panels.

import PortalLayout from "@/components/layout/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const JOB_STATUSES = ['booked', 'in_progress', 'complete'] as const;

function getJobStatusBadge(status: string) {
  switch (status) {
    case 'booked': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Booked</Badge>;
    case 'in_progress': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
    case 'complete': return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

const jobSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  clientContact: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  jobType: z.string().min(2, "Job type is required"),
  scheduledDate: z.string().optional().nullable(),
  status: z.enum(JOB_STATUSES).default("booked"),
  notes: z.string().optional().nullable(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function PortalJobs() {
  const { data: jobs, isLoading } = useListJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      clientName: "",
      clientContact: "",
      location: "",
      jobType: "",
      scheduledDate: "",
      status: "booked",
      notes: "",
    },
  });

  const openNewJob = () => {
    setEditingJob(null);
    form.reset({
      clientName: "",
      clientContact: "",
      location: "",
      jobType: "",
      scheduledDate: "",
      status: "booked",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEditJob = (job: any) => {
    setEditingJob(job);
    form.reset({
      clientName: job.clientName,
      clientContact: job.clientContact || "",
      location: job.location || "",
      jobType: job.jobType,
      scheduledDate: job.scheduledDate ? job.scheduledDate.split('T')[0] : "",
      status: job.status as any,
      notes: job.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: JobFormValues) => {
    // Convert empty strings to null for backend
    const payload = {
      ...data,
      clientContact: data.clientContact || null,
      location: data.location || null,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
      notes: data.notes || null,
    };

    if (editingJob) {
      updateJob.mutate(
        { id: editingJob.id, data: payload },
        {
          onSuccess: (updatedData) => {
            queryClient.setQueryData(getListJobsQueryKey(), (old: any) => 
              old?.map((j: any) => j.id === editingJob.id ? updatedData : j)
            );
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast({ title: "Job updated successfully" });
            setIsDialogOpen(false);
          },
          onError: () => toast({ variant: "destructive", title: "Failed to update job" })
        }
      );
    } else {
      createJob.mutate(
        { data: payload },
        {
          onSuccess: (newJob) => {
            queryClient.setQueryData(getListJobsQueryKey(), (old: any) => 
              old ? [newJob, ...old] : [newJob]
            );
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast({ title: "Job created successfully" });
            setIsDialogOpen(false);
          },
          onError: () => toast({ variant: "destructive", title: "Failed to create job" })
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteJob.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.setQueryData(getListJobsQueryKey(), (old: any) => 
            old?.filter((j: any) => j.id !== id)
          );
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Job deleted" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to delete job" });
        }
      }
    );
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateJob.mutate(
      { id, data: { status: newStatus as any } },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getListJobsQueryKey(), (old: any) => 
            old?.map((j: any) => j.id === id ? updatedData : j)
          );
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Status updated" });
        },
        onError: () => toast({ variant: "destructive", title: "Failed to update status" })
      }
    );
  };

  return (
    <PortalLayout title="Jobs">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Active & Completed Jobs</CardTitle>
          <Button onClick={openNewJob} size="sm" data-testid="button-new-job">
            <Plus size={16} className="mr-1" /> New Job
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />)}
            </div>
          ) : !jobs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No jobs found. Create one to get started.
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Scheduled</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Job Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap" data-testid={`text-job-date-${job.id}`}>
                        {job.scheduledDate ? format(new Date(job.scheduledDate), "MMM d, yyyy") : "TBD"}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground" data-testid={`text-job-client-${job.id}`}>
                        <div className="flex flex-col">
                          <span>{job.clientName}</span>
                          {job.location && <span className="text-xs text-muted-foreground font-normal">{job.location}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3" data-testid={`text-job-type-${job.id}`}>
                        {job.jobType}
                      </td>
                      <td className="px-4 py-3">
                        <Select 
                          value={job.status} 
                          onValueChange={(val) => handleStatusChange(job.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs border-0 shadow-none bg-transparent p-0 focus:ring-0" data-testid={`select-job-status-${job.id}`}>
                            {getJobStatusBadge(job.status)}
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_STATUSES.map(s => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditJob(job)}
                            data-testid={`button-edit-job-${job.id}`}
                          >
                            <Edit2 size={16} />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-job-${job.id}`}>
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the job record for {job.clientName}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(job.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingJob ? "Edit Job" : "New Job"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Mr. Smith or ABC Construction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Info (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone or email" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Romford" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Full House Reseal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_STATUSES.map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Internal notes about the job..." 
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-job-dialog">
                  Cancel
                </Button>
                <Button type="submit" disabled={createJob.isPending || updateJob.isPending} data-testid="button-submit-job">
                  {editingJob ? "Save Changes" : "Create Job"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
