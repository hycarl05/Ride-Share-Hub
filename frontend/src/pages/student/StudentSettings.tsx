import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function StudentSettings() {
  const { user, updateUser } = useAuth();
  const updateMutation = useUpdateUser();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    if (!user) return;
    updateMutation.mutate(
      { id: user.id, data: { name, phone } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast.success("Profile updated successfully");
        },
        onError: () => toast.error("Failed to update profile")
      }
    );
  };

  return (
    <AnimatedPage className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profile_photo || undefined} />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => toast.info("Photo upload coming soon")}>Change Photo</Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled className="bg-muted text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input value={user?.student_id || ''} disabled className="bg-muted text-muted-foreground" />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || (name === user?.name && phone === user?.phone)}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle dark theme for the app.</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
