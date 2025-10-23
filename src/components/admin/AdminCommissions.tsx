import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Commission {
  id: string;
  booking_amount: number;
  commission_rate: number;
  commission_amount: number;
  platform_earnings: number;
  status: string;
  created_at: string;
}

export const AdminCommissions = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    const fetchCommissions = async () => {
      const { data } = await supabase
        .from("commissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setCommissions(data);
        const totalEarnings = data.reduce((sum, c) => sum + Number(c.platform_earnings), 0);
        const pendingPayouts = data
          .filter((c) => c.status === "pending")
          .reduce((sum, c) => sum + Number(c.commission_amount), 0);
        
        setStats({ totalEarnings, pendingPayouts });
      }
      setLoading(false);
    };

    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Platform Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KES {stats.totalEarnings.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              KES {stats.pendingPayouts.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Amount</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Platform Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    KES {Number(commission.booking_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{commission.commission_rate}%</TableCell>
                  <TableCell>
                    KES {Number(commission.commission_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    KES {Number(commission.platform_earnings).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === "paid_out"
                          ? "default"
                          : commission.status === "processed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
