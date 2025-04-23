
import StegoCryptTabs from "@/components/StegoCryptTabs";
import { ThemeProvider } from "@/components/theme-provider";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-violet-50 dark:from-gray-950 dark:to-violet-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-indigo-500 dark:from-violet-400 dark:to-indigo-300">
            StegoCrypt
          </h1>
          <p className="text-muted-foreground">
            Securely hide encrypted messages in images using advanced steganography
          </p>
        </header>
        
        <main>
          <StegoCryptTabs />
        </main>
        
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>StegoCrypt - Secure your communications with steganography and encryption</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
