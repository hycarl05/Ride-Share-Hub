import { useState } from "react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UserCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useListUsers({ role: 'student', search: search || undefined });

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.studentId || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{user.email}</p>
                        <p className="text-muted-foreground">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                {!users?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No students found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}
