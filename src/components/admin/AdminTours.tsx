import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Tour {
  id: string;
  title: string;
  location_name: string;
  price_per_person: number;
  is_active: boolean;
  created_at: string;
  profiles: { full_name: string } | null;
}

export const AdminTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from("tours")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (data) {
        setTours(data as any);
      }
      setLoading(false);
    };

    fetchTours();
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
    <Card>
      <CardHeader>
        <CardTitle>All Tours</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Guide</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell>{tour.profiles?.full_name}</TableCell>
                <TableCell>{tour.location_name}</TableCell>
                <TableCell>KES {tour.price_per_person.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={tour.is_active ? "default" : "secondary"}>
                    {tour.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(tour.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
