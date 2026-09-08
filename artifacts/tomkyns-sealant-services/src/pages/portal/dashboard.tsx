import { useGetDashboardSummary } from "@workspace/api-client-react";
import PortalLayout from "@/components/layout/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getStatusBadge(status: string) {
  switch (status) {
    case 'new': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>;
    case 'contacted': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Contacted</Badge>;
    case 'quoted': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Quoted</Badge>;
    case 'booked': return <Badge className="bg-green-100 text-green-800 border-green-200">Booked</Badge>;
    case 'complete': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Complete</Badge>;
    case 'archived': return <Badge variant="outline">Archived</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PortalDashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <PortalLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-14 bg-muted/50" />
                <CardContent className="h-16" />
              </Card>
            ))}
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (isError || !summary) {
    return (
      <PortalLayout title="Dashboard">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load dashboard data. Please try again.
        </div>
      </PortalLayout>
    );
  }

  const kpis = [
    { label: "New Enquiries", value: summary.newEnquiries, icon: Inbox, color: "text-blue-500" },
    { label: "Active Jobs", value: summary.activeJobs, icon: Briefcase, color: "text-amber-500" },
    { label: "Completed Jobs", value: summary.completedJobs, icon: CheckCircle2, color: "text-green-500" },
    { label: "Total Enquiries", value: summary.totalEnquiries, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <PortalLayout title="Dashboard">
      <div className="space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Enquiries</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">Latest leads that need your attention.</div>
            </div>
            <Link href="/portal/enquiries">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {summary.recentEnquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent enquiries found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {summary.recentEnquiries.map(enq => (
                  <div key={enq.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{enq.name}</span>
                        {getStatusBadge(enq.status)}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3">
                        <span>{enq.phone}</span>
                        {enq.postcode && <span>• {enq.postcode}</span>}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-left md:text-right">
                      {format(new Date(enq.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
