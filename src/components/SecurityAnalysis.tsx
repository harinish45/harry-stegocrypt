import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Eye, FileCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SecurityAnalysis = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Analysis: Cryptography + Steganography
          </CardTitle>
          <CardDescription>
            Understanding how this application provides multilayered security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="confidentiality">Confidentiality</TabsTrigger>
              <TabsTrigger value="integrity">Integrity</TabsTrigger>
              <TabsTrigger value="nonrepudiation">Non-Repudiation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Two-Layer Security Model</AlertTitle>
                <AlertDescription>
                  This application combines cryptography and steganography to provide defense-in-depth security.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Layer 1: Cryptography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Encrypts the message using strong algorithms (AES-256, RSA-2048, ChaCha20)
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Protects message content</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Prevents unauthorized reading</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Multiple algorithm options</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Layer 2: Steganography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Hides the encrypted message inside an image using LSB (Least Significant Bit) technique
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Conceals message existence</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Imperceptible to human eye</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>No visual artifacts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="confidentiality" className="space-y-4 mt-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Confidentiality</AlertTitle>
                <AlertDescription>
                  Ensuring that information is accessible only to authorized parties
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How This App Ensures Confidentiality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Strong Encryption Algorithms</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      <li><strong>AES-256:</strong> Industry-standard symmetric encryption, used by governments</li>
                      <li><strong>RSA-2048:</strong> Asymmetric encryption for secure key exchange</li>
                      <li><strong>ChaCha20:</strong> Modern stream cipher, excellent for performance</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Steganographic Concealment</h4>
                    <p className="text-sm text-muted-foreground">
                      Even if an attacker intercepts the image, they won't know it contains a hidden message. 
                      The encrypted data is embedded in the least significant bits of pixel values, making it 
                      invisible to casual observation.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Key Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Messages can only be decrypted with the correct encryption key. The key is never stored 
                      in the image, maintaining separation between the encrypted data and the decryption key.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrity" className="space-y-4 mt-4">
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertTitle>Integrity</AlertTitle>
                <AlertDescription>
                  Ensuring that information has not been altered in an unauthorized manner
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How This App Ensures Integrity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. SHA-256 Hashing</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Before encryption, the application generates a SHA-256 hash of the original message. 
                      This creates a unique "fingerprint" of the data.
                    </p>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Any modification to the message, even a single character, will result in a completely 
                        different hash value, immediately revealing tampering.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Encryption-Based Integrity</h4>
                    <p className="text-sm text-muted-foreground">
                      The encryption algorithms themselves provide integrity protection. If the encrypted data 
                      is modified, decryption will fail or produce garbage output, alerting you to tampering.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Metadata Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      The application records encryption metadata including timestamp, algorithm used, and 
                      message hash. This provides an audit trail for verification.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nonrepudiation" className="space-y-4 mt-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Non-Repudiation</AlertTitle>
                <AlertDescription>
                  Ensuring that a party cannot deny the authenticity of their communication
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How This App Supports Non-Repudiation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. RSA Public Key Cryptography</h4>
                    <p className="text-sm text-muted-foreground">
                      When using RSA encryption, messages encrypted with someone's public key can only be 
                      decrypted with their private key. This proves that only the intended recipient can 
                      read the message.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Timestamp Recording</h4>
                    <p className="text-sm text-muted-foreground">
                      Each encryption operation is timestamped, creating a verifiable record of when the 
                      message was encrypted. This helps establish a timeline of communications.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Hash-Based Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      The SHA-256 hash serves as a unique identifier for the message content. By comparing 
                      hashes, you can prove that a specific message was sent without revealing its contents.
                    </p>
                  </div>

                  <Alert className="mt-4">
                    <AlertDescription className="text-xs">
                      <strong>Note:</strong> For full non-repudiation in real-world scenarios, digital 
                      signatures would typically be used. This application demonstrates the foundational 
                      concepts that enable non-repudiation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
