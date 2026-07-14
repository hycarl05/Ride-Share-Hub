import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, ArrowLeft, Upload } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterDriver } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

const driverSchema = z.object({
  icNumber: z.string().min(12, 'IC number must be 12 digits'),
  licenseNumber: z.string().min(5, 'Valid license number required'),
  vehicleType: z.string().min(2, 'Vehicle type (e.g. Perodua Myvi) required'),
  vehiclePlate: z.string().min(2, 'Vehicle plate required'),
  profilePhoto: z.string().optional(),
  vehiclePhoto: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function DriverRegister() {
  const [, setLocation] = useLocation();
  const registerMutation = useRegisterDriver();
  const { toast } = useToast();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: { icNumber: '', licenseNumber: '', vehicleType: '', vehiclePlate: '' },
  });

  const onSubmit = (data: DriverFormValues) => {
    // In a real app we'd upload photos to a bucket first.
    // For now we'll send the mock URLs or leave them empty.
    registerMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ 
          title: 'Application Submitted', 
          description: 'Your application is pending admin approval. You will be notified once approved.',
          duration: 5000
        });
        setLocation('/');
      },
      onError: (err: any) => {
        toast({ 
          title: 'Submission failed', 
          description: err.message || 'Something went wrong.', 
          variant: 'destructive' 
        });
      }
    });
  };

  // Mock file input click
  const triggerFileInput = (id: string) => {
    document.getElementById(id)?.click();
  };

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
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
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Apply to Drive</CardTitle>
            <CardDescription>We manually verify all drivers for campus safety.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number</FormLabel>
                        <FormControl>
                          <Input placeholder="010203104567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Driving License No." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Perodua Myvi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehiclePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC 1234" className="uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormDescription>Clear face photo for riders.</FormDescription>
                      <input type="file" id="profile-upload" className="hidden" accept="image/*" />
                      <div 
                        onClick={() => triggerFileInput('profile-upload')}
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Upload photo</span>
                      </div>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Vehicle Photo</FormLabel>
                      <FormDescription>Showing plate clearly.</FormDescription>
                      <input type="file" id="vehicle-upload" className="hidden" accept="image/*" />
                      <div 
                        onClick={() => triggerFileInput('vehicle-upload')}
                        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Upload photo</span>
                      </div>
                    </FormItem>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-md mt-6" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-muted-foreground text-sm">
          Note: You must register a Student account first before applying to drive. 
          If you are logged in, your current account will be linked.
        </p>
      </div>
    </AnimatedPage>
  );
}
