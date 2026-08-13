import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Unlock, Download, Copy, BookOpen, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUpload from './ImageUpload';
import KeyInput from './KeyInput';
import { AlgorithmSelector } from './AlgorithmSelector';
import { EncryptionMetadataDisplay } from './EncryptionMetadataDisplay';
import { SecurityAnalysis } from './SecurityAnalysis';
import { CapacityIndicator } from './CapacityIndicator';
import { encryptMessage, decryptMessage, EncryptionAlgorithm, EncryptionMetadata, generateSHA256Hash } from '@/utils/encryptionAdvanced';
import { hideMessage, retrieveMessage, imageDataToDataURL } from '@/utils/steganography';
import { useToast } from "@/hooks/use-toast";

const StegoCryptTabs: React.FC = () => {
  // Toast notification helper
  const { toast } = useToast();
  
  // Image state
  const [imageData, setImageData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  
  // Message input states
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>('AES');
  
  // Encryption outputs
  const [encryptedMessage, setEncryptedMessage] = useState<string | null>(null);
  const [steganoImageURL, setSteganoImageURL] = useState<string | null>(null);
  const [encryptionMetadata, setEncryptionMetadata] = useState<EncryptionMetadata | null>(null);
  
  // Decryption inputs and outputs
  const [decryptKey, setDecryptKey] = useState('');
  const [decryptAlgorithm, setDecryptAlgorithm] = useState<EncryptionAlgorithm>('AES');
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [extractedHash, setExtractedHash] = useState<string | null>(null);
  const [hashMatch, setHashMatch] = useState<boolean | null>(null);
  
  // Processing states
  const [encodeLoading, setEncodeLoading] = useState(false);
  const [decodeLoading, setDecodeLoading] = useState(false);
  
  const handleImageLoaded = (
    imgData: Uint8ClampedArray, 
    width: number, 
    height: number, 
    original: string
  ) => {
    setImageData(imgData);
    setImageWidth(width);
    setImageHeight(height);
    setOriginalImage(original);
    
    // Reset states when a new image is loaded
    setSteganoImageURL(null);
    setExtractedMessage(null);
    setDecryptedMessage(null);
    
    toast({
      title: "Image Loaded",
      description: `${width}×${height} image loaded successfully`,
    });
  };

  const validateEncodeInputs = () => {
    if (!imageData) {
      toast({
        title: "Missing Image",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return false;
    }
    if (!message) {
      toast({
        title: "Missing Message",
        description: "Please enter a message to hide",
        variant: "destructive"
      });
      return false;
    }
    if (!key) {
      toast({
        title: "Missing Key",
        description: "Please provide an encryption key",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateDecodeInputs = () => {
    if (!imageData) {
      toast({
        title: "Missing Image",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return false;
    }
    if (!decryptKey) {
      toast({
        title: "Missing Key",
        description: "Please provide the decryption key",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const copyToClipboard = async () => {
    if (!decryptedMessage) return;
    try {
      await navigator.clipboard.writeText(decryptedMessage);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const handleEncode = async () => {
    if (!validateEncodeInputs()) return;
    
    try {
      setEncodeLoading(true);
      
      // Step 1: Encrypt the message
      const { encrypted, metadata } = encryptMessage(message, key, algorithm);
      setEncryptedMessage(encrypted);
      setEncryptionMetadata(metadata);
      
      // Step 2: Hide the encrypted message in the image
      const stegoData = hideMessage(imageData!, encrypted);
      
      // Step 3: Convert the modified image data to a data URL
      const dataURL = imageDataToDataURL(stegoData, imageWidth, imageHeight);
      setSteganoImageURL(dataURL);
      
      toast({
        title: "Success!",
        description: `Message encrypted with ${algorithm} and hidden in the image`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to hide message",
        variant: "destructive"
      });
    } finally {
      setEncodeLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!validateDecodeInputs()) return;
    
    try {
      setDecodeLoading(true);
      console.log("Starting decoding process with image data length:", imageData?.length);
      
      // Step 1: Extract the hidden message
      const extractedEncryptedMessage = retrieveMessage(imageData!);
      console.log("Extracted encrypted message:", extractedEncryptedMessage);
      setExtractedMessage(extractedEncryptedMessage);
      
      if (!extractedEncryptedMessage) {
        toast({
          title: "No message found",
          description: "No hidden message was detected in this image",
          variant: "destructive"
        });
        setDecodeLoading(false);
        return;
      }
      
      // Step 2: Try to decrypt the message
      try {
        console.log("Attempting to decrypt with key length:", decryptKey.length);
        const decrypted = decryptMessage(extractedEncryptedMessage, decryptKey, decryptAlgorithm);
        console.log("Decryption result:", decrypted ? "Success" : "Failed");
        setDecryptedMessage(decrypted);
        
        // Step 3: Verify hash integrity
        if (decrypted) {
          const currentHash = generateSHA256Hash(decrypted);
          setExtractedHash(currentHash);
          
          // Note: We can't compare with original hash without storing it
          // But we can show the hash for manual verification
          
          toast({
            title: "Success!",
            description: "Message extracted and decrypted successfully"
          });
        } else {
          toast({
            title: "Decryption failed",
            description: "The key provided could not decrypt the message",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Decryption error:", error);
        toast({
          title: "Decryption error",
          description: "The key provided could not decrypt the message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Message extraction error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to retrieve message",
        variant: "destructive"
      });
    } finally {
      setDecodeLoading(false);
    }
  };

  const downloadSteganoImage = () => {
    if (!steganoImageURL) return;
    
    // Create a temporary link and click it to download
    const a = document.createElement('a');
    a.href = steganoImageURL;
    a.download = 'stegocrypt_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded"
    });
  };

  return (
    <Tabs defaultValue="hide" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 h-auto gap-1 p-1">
        <TabsTrigger value="hide" className="flex-col md:flex-row gap-1 md:gap-0 text-[13px] md:text-base py-2.5 md:py-3 whitespace-normal leading-tight text-center">
          <Lock className="h-4 w-4 md:mr-2" /> Hide Message
        </TabsTrigger>
        <TabsTrigger value="retrieve" className="flex-col md:flex-row gap-1 md:gap-0 text-[13px] md:text-base py-2.5 md:py-3 whitespace-normal leading-tight text-center">
          <Unlock className="h-4 w-4 md:mr-2" /> Retrieve Message
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex-col md:flex-row gap-1 md:gap-0 text-[13px] md:text-base py-2.5 md:py-3 whitespace-normal leading-tight text-center">
          <BookOpen className="h-4 w-4 md:mr-2" /> Security Analysis
        </TabsTrigger>
      </TabsList>

      
      {/* Hide Message Tab */}
      <TabsContent value="hide" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Image</CardTitle>
              <CardDescription>Upload an image to hide your message</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageLoaded={handleImageLoaded} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Secret Message</CardTitle>
              <CardDescription>Enter the message you want to hide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter your secret message here" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <AlgorithmSelector
                value={algorithm}
                onChange={setAlgorithm}
              />
              
              <KeyInput
                id="key"
                value={key}
                onChange={setKey}
              />
              
              {imageData && message && (
                <CapacityIndicator
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  messageLength={message.length}
                />
              )}
              
              <Button 
                onClick={handleEncode} 
                disabled={!imageData || !message || !key || encodeLoading}
                className="w-full"
              >
                {encodeLoading ? "Processing..." : "Encrypt & Embed"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {steganoImageURL && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>Your message has been hidden in this image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={steganoImageURL} 
                    alt="Processed Image" 
                    className="max-h-64 object-contain rounded border"
                  />
                </div>
                <Button 
                  onClick={downloadSteganoImage}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" /> Download Image
                </Button>
              </CardContent>
            </Card>
            
            <EncryptionMetadataDisplay metadata={encryptionMetadata} />
          </div>
        )}
      </TabsContent>
      
      {/* Retrieve Message Tab */}
      <TabsContent value="retrieve" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Image</CardTitle>
              <CardDescription>Upload an image to extract hidden message</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageLoaded={handleImageLoaded} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Decryption</CardTitle>
              <CardDescription>Provide the key to decrypt the hidden message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlgorithmSelector
                value={decryptAlgorithm}
                onChange={setDecryptAlgorithm}
              />
              
              <KeyInput
                id="decrypt-key"
                value={decryptKey}
                onChange={setDecryptKey}
                label="Decryption Key"
              />
              
              <Button 
                onClick={handleDecode} 
                disabled={!imageData || decodeLoading}
                className="w-full"
              >
                {decodeLoading ? "Processing..." : "Extract & Verify"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {extractedMessage !== null && (
          <Card>
            <CardHeader>
              <CardTitle>Retrieved Message</CardTitle>
              <CardDescription>
                {decryptedMessage 
                  ? "Your decrypted message is shown below" 
                  : "Encrypted message was found but could not be decrypted"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {decryptedMessage ? (
                <>
                  <div className="relative">
                    <div className="p-4 border rounded bg-primary/5 break-words">
                      {decryptedMessage}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {extractedHash && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Hash className="h-4 w-4" />
                        Message Hash (SHA-256)
                      </div>
                      <code className="block text-xs font-mono break-all">
                        {extractedHash}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Compare this hash with the original to verify integrity
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Message found but unable to decrypt. Please check your decryption key and algorithm.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      {/* Security Analysis Tab */}
      <TabsContent value="analysis">
        <SecurityAnalysis />
      </TabsContent>
    </Tabs>
  );
};

export default StegoCryptTabs;
