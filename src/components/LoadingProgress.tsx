import { Progress } from "@/components/ui/progress";
import { Loader2, Lock, Image, Hash, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoadingProgressProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
}

const getStepInfo = (step: string) => {
  const steps = {
    encrypting: { icon: Lock, label: "Encrypting", color: "text-blue-500" },
    embedding: { icon: Image, label: "Embedding", color: "text-purple-500" },
    hashing: { icon: Hash, label: "Hashing", color: "text-green-500" },
    finalizing: { icon: CheckCircle2, label: "Finalizing", color: "text-emerald-500" },
    decrypting: { icon: Lock, label: "Decrypting", color: "text-blue-500" },
    extracting: { icon: Image, label: "Extracting", color: "text-purple-500" },
    verifying: { icon: Hash, label: "Verifying", color: "text-green-500" },
  };
  
  return steps[step as keyof typeof steps] || { icon: Loader2, label: "Processing", color: "text-muted-foreground" };
};

export const LoadingProgress = ({ isOpen, progress, currentStep }: LoadingProgressProps) => {
  const stepInfo = getStepInfo(currentStep);
  const StepIcon = stepInfo.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <StepIcon className={`h-16 w-16 ${stepInfo.color} opacity-20`} />
            </div>
            <StepIcon className={`h-16 w-16 ${stepInfo.color} animate-pulse`} />
          </div>
          
          <div className="text-center space-y-2 w-full">
            <h3 className="text-lg font-semibold">{stepInfo.label}...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your request
            </p>
          </div>
          
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-center text-xs text-muted-foreground">
              {Math.round(progress)}% Complete
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className={`flex items-center gap-2 ${progress >= 25 ? 'text-foreground font-medium' : ''}`}>
              <Lock className="h-3 w-3" />
              <span>Encrypt</span>
            </div>
            <div className={`flex items-center gap-2 ${progress >= 50 ? 'text-foreground font-medium' : ''}`}>
              <Image className="h-3 w-3" />
              <span>Embed</span>
            </div>
            <div className={`flex items-center gap-2 ${progress >= 75 ? 'text-foreground font-medium' : ''}`}>
              <Hash className="h-3 w-3" />
              <span>Hash</span>
            </div>
            <div className={`flex items-center gap-2 ${progress >= 100 ? 'text-foreground font-medium' : ''}`}>
              <CheckCircle2 className="h-3 w-3" />
              <span>Done</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
