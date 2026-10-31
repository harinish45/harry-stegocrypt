import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateCapacity, calculateUtilizationPercent } from "@/lib/steganography/capacity";

interface CapacityIndicatorProps {
  imageWidth: number;
  imageHeight: number;
  messageLength: number;
}

export const CapacityIndicator = ({ imageWidth, imageHeight, messageLength }: CapacityIndicatorProps) => {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return null;
  }

  // Calculate capacity using steganography engine
  const capacity = calculateCapacity(imageWidth, imageHeight);
  const availableBytes: number = capacity.maxPayloadBytes;
  
  // Estimate byte length of message
  const messageBytes: number = new TextEncoder().encode(messageLength.toString()).length;
  const percentageUsed: number = calculateUtilizationPercent(messageBytes, availableBytes);
  
  const getStatusConfig = () => {
    if (percentageUsed > 90) {
      return {
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        message: "Image capacity almost full",
        progressColor: "bg-destructive"
      };
    } else if (percentageUsed > 60) {
      return {
        icon: Info,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        message: "Good capacity usage",
        progressColor: "bg-yellow-500"
      };
    } else {
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950",
        message: "Plenty of capacity available",
        progressColor: "bg-green-500"
      };
    }
  };
  
  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Image Capacity</span>
        <span className="text-muted-foreground font-mono">
          {messageBytes} / {availableBytes.toLocaleString()} bytes
        </span>
      </div>
      
      <Progress 
        value={Math.min(percentageUsed, 100)} 
        className="h-2" 
        indicatorClassName={status.progressColor}
      />
      
      <Alert className={status.bgColor}>
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        <AlertDescription className="text-xs">
          <span className="font-medium">{status.message}</span>
          <br />
          Image can hold up to {availableBytes.toLocaleString()} raw payload bytes.
          {percentageUsed > 90 && " Consider using a larger image or shorter message."}
        </AlertDescription>
      </Alert>
    </div>
  );
};
