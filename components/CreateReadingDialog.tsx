import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioTower } from "lucide-react";
import { useCreateReading } from "@/hooks/use-readings";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  ph: z.coerce.number().min(0).max(14),
  turbidity: z.coerce.number().min(0),
  temperature: z.coerce.number(),
  hardness: z.coerce.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

export function CreateReadingDialog({ sensorId }: { sensorId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateReading();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { ph: 7.0, turbidity: 2.5, temperature: 20.0, hardness: 80.0 },
  });

  const onSubmit = (data: FormData) => {
    // API expects number values for numeric columns
    const payload = {
      sensorId,
      ph: data.ph,
      turbidity: data.turbidity,
      temperature: data.temperature,
      hardness: data.hardness,
    };

    create.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Telemetry Injected",
          description: `Data transmitted to ${sensorId}.`,
        });
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Transmission Failed",
          description: error.message,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="border-green-500/50 bg-green-950/20 hover:bg-green-900/40 text-green-400 font-display tracking-widest uppercase transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]"
        >
          <RadioTower className="h-4 w-4 mr-2" /> Inject Telemetry
        </Button>
      </DialogTrigger>
      <DialogContent className="border-green-500/50 bg-[#0A0A0F]/95 backdrop-blur-2xl text-slate-200 shadow-[0_0_50px_rgba(74,222,128,0.1)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="neon-green-text font-display text-xl tracking-[0.2em] uppercase">
            Manual Data Override
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-green-500/80 font-mono text-[10px] tracking-widest">pH LEVEL</Label>
              <Input 
                {...form.register("ph")} 
                type="number" step="0.01"
                className="bg-[#05050A] border-slate-800 focus-visible:border-green-500 font-mono text-green-50" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-500/80 font-mono text-[10px] tracking-widest">TURBIDITY (NTU)</Label>
              <Input 
                {...form.register("turbidity")} 
                type="number" step="0.01"
                className="bg-[#05050A] border-slate-800 focus-visible:border-green-500 font-mono text-green-50" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-500/80 font-mono text-[10px] tracking-widest">TEMPERATURE (°C)</Label>
              <Input 
                {...form.register("temperature")} 
                type="number" step="0.1"
                className="bg-[#05050A] border-slate-800 focus-visible:border-green-500 font-mono text-green-50" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-500/80 font-mono text-[10px] tracking-widest">HARDNESS (mg/L)</Label>
              <Input 
                {...form.register("hardness")} 
                type="number" step="0.1"
                className="bg-[#05050A] border-slate-800 focus-visible:border-green-500 font-mono text-green-50" 
              />
            </div>
          </div>
          
          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={create.isPending} 
              className="w-full bg-green-500 text-[#05050A] hover:bg-green-400 font-display tracking-[0.2em] text-lg py-6 transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)]"
            >
              {create.isPending ? "TRANSMITTING..." : "FORCE TRANSMISSION"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
