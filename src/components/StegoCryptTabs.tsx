
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Unlock, Download, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from './ImageUpload';
import { encryptMessage, decryptMessage } from '@/utils/encryption';
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
  
  // Encryption outputs
  const [encryptedMessage, setEncryptedMessage] = useState<string | null>(null);
  const [steganoImageURL, setSteganoImageURL] = useState<string | null>(null);
  
  // Decryption inputs and outputs
  const [decryptKey, setDecryptKey] = useState('');
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  
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
  };

  const handleEncode = async () => {
    try {
      if (!imageData || !message || !key) {
        toast({
          title: "Missing information",
          description: "Please provide an image, message, and encryption key",
          variant: "destructive"
        });
        return;
      }
      
      setEncodeLoading(true);
      
      // Step 1: Encrypt the message
      const encrypted = encryptMessage(message, key);
      setEncryptedMessage(encrypted);
      
      // Step 2: Hide the encrypted message in the image
      const stegoData = hideMessage(imageData, encrypted);
      
      // Step 3: Convert the modified image data to a data URL
      const dataURL = imageDataToDataURL(stegoData, imageWidth, imageHeight);
      setSteganoImageURL(dataURL);
      
      toast({
        title: "Success!",
        description: "Your message has been hidden in the image",
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
    try {
      if (!imageData) {
        toast({
          title: "Missing image",
          description: "Please upload an image first",
          variant: "destructive"
        });
        return;
      }
      
      setDecodeLoading(true);
      
      // Step 1: Extract the hidden message
      const extractedEncryptedMessage = retrieveMessage(imageData);
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
      
      // If we have a decryption key, try to decrypt the message
      if (decryptKey) {
        try {
          const decrypted = decryptMessage(extractedEncryptedMessage, decryptKey);
          setDecryptedMessage(decrypted);
          
          if (!decrypted) {
            toast({
              title: "Decryption failed",
              description: "The key provided could not decrypt the message",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success!",
              description: "Message extracted and decrypted successfully",
            });
          }
        } catch (error) {
          toast({
            title: "Decryption error",
            description: "The key provided could not decrypt the message",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Message found",
          description: "Encrypted message was extracted. Enter a key to decrypt.",
        });
      }
    } catch (error) {
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
  };

  return (
    <Tabs defaultValue="hide" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="hide" className="text-base py-3">
          <Lock className="h-4 w-4 mr-2" /> Hide Message
        </TabsTrigger>
        <TabsTrigger value="retrieve" className="text-base py-3">
          <Unlock className="h-4 w-4 mr-2" /> Retrieve Message
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
              
              <div className="space-y-2">
                <Label htmlFor="key">Encryption Key</Label>
                <div className="relative">
                  <Input 
                    id="key"
                    type="password"
                    placeholder="Enter encryption key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="pr-10"
                  />
                  <Key className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              
              <Button 
                onClick={handleEncode} 
                disabled={!imageData || !message || !key || encodeLoading}
                className="w-full"
              >
                {encodeLoading ? "Processing..." : "Hide Message"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {steganoImageURL && (
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
                  className="max-h-64 object-contain border rounded"
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
              <div className="space-y-2">
                <Label htmlFor="decrypt-key">Decryption Key</Label>
                <div className="relative">
                  <Input 
                    id="decrypt-key"
                    type="password"
                    placeholder="Enter decryption key"
                    value={decryptKey}
                    onChange={(e) => setDecryptKey(e.target.value)}
                    className="pr-10"
                  />
                  <Key className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              
              <Button 
                onClick={handleDecode} 
                disabled={!imageData || decodeLoading}
                className="w-full"
              >
                {decodeLoading ? "Processing..." : "Retrieve Message"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {extractedMessage && (
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
                <div className="p-4 border rounded bg-primary/5 break-words">
                  {decryptedMessage}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Message found but unable to decrypt.</p>
                  <p>Please check your decryption key.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default StegoCryptTabs;
