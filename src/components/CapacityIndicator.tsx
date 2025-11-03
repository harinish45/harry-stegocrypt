import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CapacityIndicatorProps {
  imageWidth: number;
  imageHeight: number;
  messageLength: number;
}

export const CapacityIndicator = ({ imageWidth, imageHeight, messageLength }: CapacityIndicatorProps) => {
  // Calculate capacity (3 bits per pixel for RGB channels, excluding alpha)
  const totalPixels = imageWidth * imageHeight;
  const totalBits = totalPixels * 3; // 3 channels (RGB)
  const totalBytes = Math.floor(totalBits / 8);
  
  // Reserve 24 bits (3 bytes) for message length prefix
  const availableBytes = totalBytes - 3;
  
  // Current message in bytes (UTF-8 encoding can be up to 4 bytes per character)
  const messageBytes = new Blob([messageLength.toString()]).size;
  
  // Calculate percentage used
  const percentageUsed = (messageBytes / availableBytes) * 100;
  
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
        <span className="text-muted-foreground">
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
          Image can hold approximately {availableBytes.toLocaleString()} characters.
          {percentageUsed > 90 && " Consider using a larger image or shorter message."}
        </AlertDescription>
      </Alert>
    </div>
  );
};
