import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useCreateSensor } from "@/hooks/use-sensors";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  sensorId: z.string().min(1, "Sensor ID is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  locationName: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateSensorDialogProps {
  /** If true, dialog open state is controlled externally */
  controlled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultLatitude?: number;
  defaultLongitude?: number;
}

export function CreateSensorDialog({ 
  controlled = false, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  defaultLatitude,
  defaultLongitude,
}: CreateSensorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const create = useCreateSensor();
  const { toast } = useToast();

  const isOpen = controlled ? (controlledOpen ?? false) : internalOpen;
  const setIsOpen = controlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { sensorId: "", latitude: 0, longitude: 0, locationName: "" },
  });

  // Pre-fill lat/lng when defaults change (from map click)
  useEffect(() => {
    if (defaultLatitude !== undefined && defaultLongitude !== undefined) {
      form.setValue("latitude", parseFloat(defaultLatitude.toFixed(6)));
      form.setValue("longitude", parseFloat(defaultLongitude.toFixed(6)));
    }
  }, [defaultLatitude, defaultLongitude, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Node Deployed",
          description: `Sensor ${data.sensorId} integrated into global grid.`,
        });
        setIsOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Deployment Failed",
          description: error.message,
        });
      }
    });
  };

  // If controlled mode, don't render trigger button
  if (controlled) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-cyan-500/50 bg-[#0A0A0F]/95 backdrop-blur-2xl text-slate-200 shadow-[0_0_50px_rgba(0,243,255,0.15)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="neon-text font-display text-2xl tracking-[0.2em] uppercase">
              Deploy Sensor Node
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">SENSOR ID</Label>
              <Input 
                {...form.register("sensorId")} 
                className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                placeholder="AQUA-NODE-001" 
              />
              {form.formState.errors.sensorId && <p className="text-red-400 text-xs mt-1">{form.formState.errors.sensorId.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LATITUDE</Label>
                <Input 
                  {...form.register("latitude")} 
                  className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                  placeholder="40.7128" 
                />
                {form.formState.errors.latitude && <p className="text-red-400 text-xs mt-1">{form.formState.errors.latitude.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LONGITUDE</Label>
                <Input 
                  {...form.register("longitude")} 
                  className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                  placeholder="-74.0060" 
                />
                {form.formState.errors.longitude && <p className="text-red-400 text-xs mt-1">{form.formState.errors.longitude.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LOCATION DESIGNATION</Label>
              <Input 
                {...form.register("locationName")} 
                className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                placeholder="Hudson River Sector Alpha" 
              />
            </div>
            
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={create.isPending} 
                className="w-full bg-cyan-500 text-[#05050A] hover:bg-cyan-400 font-display tracking-[0.3em] text-lg py-6 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                {create.isPending ? "INITIALIZING..." : "EXECUTE DEPLOYMENT"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: uncontrolled mode with trigger button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="neon-border bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 font-display tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_25px_rgba(0,243,255,0.3)]"
        >
          <Plus className="h-4 w-4 mr-2" /> Deploy Node
        </Button>
      </DialogTrigger>
      <DialogContent className="border-cyan-500/50 bg-[#0A0A0F]/95 backdrop-blur-2xl text-slate-200 shadow-[0_0_50px_rgba(0,243,255,0.15)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="neon-text font-display text-2xl tracking-[0.2em] uppercase">
            Deploy Sensor Node
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">SENSOR ID</Label>
            <Input 
              {...form.register("sensorId")} 
              className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
              placeholder="AQUA-NODE-001" 
            />
            {form.formState.errors.sensorId && <p className="text-red-400 text-xs mt-1">{form.formState.errors.sensorId.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LATITUDE</Label>
              <Input 
                {...form.register("latitude")} 
                className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                placeholder="40.7128" 
              />
              {form.formState.errors.latitude && <p className="text-red-400 text-xs mt-1">{form.formState.errors.latitude.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LONGITUDE</Label>
              <Input 
                {...form.register("longitude")} 
                className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
                placeholder="-74.0060" 
              />
              {form.formState.errors.longitude && <p className="text-red-400 text-xs mt-1">{form.formState.errors.longitude.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-cyan-500/80 font-mono text-[10px] tracking-widest">LOCATION DESIGNATION</Label>
            <Input 
              {...form.register("locationName")} 
              className="bg-[#05050A] border-slate-800 focus-visible:border-cyan-500 font-mono text-cyan-50" 
              placeholder="Hudson River Sector Alpha" 
            />
          </div>
          
          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={create.isPending} 
              className="w-full bg-cyan-500 text-[#05050A] hover:bg-cyan-400 font-display tracking-[0.3em] text-lg py-6 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            >
              {create.isPending ? "INITIALIZING..." : "EXECUTE DEPLOYMENT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
