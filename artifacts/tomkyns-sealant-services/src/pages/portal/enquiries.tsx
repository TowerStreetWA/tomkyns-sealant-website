import { useState } from "react";
import { useListEnquiries, useUpdateEnquiry, useDeleteEnquiry, getListEnquiriesQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PortalLayout from "@/components/layout/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ExternalLink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STATUSES = ['new', 'contacted', 'quoted', 'booked', 'complete', 'archived'] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case 'new': return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">New</Badge>;
    case 'contacted': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Contacted</Badge>;
    case 'quoted': return <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100">Quoted</Badge>;
    case 'booked': return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Booked</Badge>;
    case 'complete': return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Complete</Badge>;
    case 'archived': return <Badge variant="outline">Archived</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PortalEnquiries() {
  const { data: enquiries, isLoading } = useListEnquiries();
  const updateEnquiry = useUpdateEnquiry();
  const deleteEnquiry = useDeleteEnquiry();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateEnquiry.mutate(
      { id, data: { status: newStatus as any } },
      {
        onSuccess: (updatedData) => {
          queryClient.setQueryData(getListEnquiriesQueryKey(), (old: any) => 
            old?.map((enq: any) => enq.id === id ? updatedData : enq)
          );
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Status updated" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to update status" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteEnquiry.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.setQueryData(getListEnquiriesQueryKey(), (old: any) => 
            old?.filter((enq: any) => enq.id !== id)
          );
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Enquiry deleted" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to delete enquiry" });
        }
      }
    );
  };

  return (
    <PortalLayout title="Enquiries">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Enquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />)}
            </div>
          ) : !enquiries?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No enquiries found.
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(new Date(enq.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground" data-testid={`text-enquiry-name-${enq.id}`}>
                        {enq.name}
                      </td>
                      <td className="px-4 py-3" data-testid={`text-enquiry-contact-${enq.id}`}>
                        <div className="flex flex-col">
                          <span>{enq.phone}</span>
                          {enq.email && <span className="text-muted-foreground">{enq.email}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select 
                          value={enq.status} 
                          onValueChange={(val) => handleStatusChange(enq.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs border-0 shadow-none bg-transparent p-0 focus:ring-0" data-testid={`select-enquiry-status-${enq.id}`}>
                            {getStatusBadge(enq.status)}
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map(s => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-testid={`button-view-enquiry-${enq.id}`}>
                                <ExternalLink size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle className="font-display text-xl">Enquiry Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Name</div>
                                    <div className="font-medium">{enq.name}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Status</div>
                                    <div>{getStatusBadge(enq.status)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Phone</div>
                                    <div>{enq.phone}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Email</div>
                                    <div>{enq.email || "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Postcode</div>
                                    <div>{enq.postcode || "—"}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Submitted</div>
                                    <div>{format(new Date(enq.createdAt), "PPp")}</div>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground font-medium mb-2">Project Details</div>
                                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                    {enq.details || "No details provided."}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-enquiry-${enq.id}`}>
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Enquiry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the enquiry from {enq.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(enq.id)}
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
    </PortalLayout>
  );
}
