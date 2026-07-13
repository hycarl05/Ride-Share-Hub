import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, UserCircle, Car, Shield } from 'lucide-react';
import { Link } from 'wouter';
import { AnimatedPage } from '@/components/AnimatedPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'driver' | 'admin'>('student');
  const loginMutation = useLogin();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.user, res.token);
        toast({ title: 'Welcome back!', description: 'Logged in successfully.' });
      },
      onError: (err: any) => {
        toast({ 
          title: 'Login failed', 
          description: err.message || 'Invalid email or password', 
          variant: 'destructive' 
        });
      }
    });
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight">Prebet UPSI</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" onValueChange={(v) => setRole(v as any)} className="mb-6">
              <TabsList className="grid grid-cols-3 mb-4 h-12">
                <TabsTrigger value="student" className="h-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <UserCircle className="w-4 h-4 mr-2" /> Student
                </TabsTrigger>
                <TabsTrigger value="driver" className="h-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Car className="w-4 h-4 mr-2" /> Driver
                </TabsTrigger>
                <TabsTrigger value="admin" className="h-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Shield className="w-4 h-4 mr-2" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder={`your.email@${role === 'student' ? 'siswa.upsi.edu.my' : 'example.com'}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-md mt-2" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? 'Logging in...' : `Log in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {role === 'student' && (
          <p className="text-center mt-6 text-muted-foreground text-sm">
            Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Register here</Link>
          </p>
        )}
        {role === 'driver' && (
          <p className="text-center mt-6 text-muted-foreground text-sm">
            Want to drive with us? <Link href="/driver/register" className="text-primary font-medium hover:underline">Apply here</Link>
          </p>
        )}
      </div>
    </AnimatedPage>
  );
}
