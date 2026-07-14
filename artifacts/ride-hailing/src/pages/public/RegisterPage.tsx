import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { AnimatedPage } from '@/components/AnimatedPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  studentId: z.string().min(5, 'Valid Student ID is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', studentId: '', email: '', phone: '', password: '' },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.user, res.token);
        toast({ title: 'Registration successful', description: 'Welcome to Prebet UPSI!' });
      },
      onError: (err: any) => {
        toast({ 
          title: 'Registration failed', 
          description: err.message || 'Something went wrong. Please try again.', 
          variant: 'destructive' 
        });
      }
    });
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
        </Link>
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight">Prebet UPSI</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Join as a student passenger</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmad Fariz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID (Matric No.)</FormLabel>
                      <FormControl>
                        <Input placeholder="D20201012345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siswa Email</FormLabel>
                      <FormControl>
                        <Input placeholder="d20201012345@siswa.upsi.edu.my" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
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
                        <Input type="password" placeholder="Create a strong password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-md mt-4" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          Already have an account? <Link href="/" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
