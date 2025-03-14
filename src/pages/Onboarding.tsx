
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, ArrowRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AnimatedTransition from '@/components/AnimatedTransition';

const Onboarding = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast({
        title: "Missing information",
        description: "Please provide both your name and email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store user information in Supabase
      const { data, error } = await supabase
        .from('early_access')
        .insert([{ email, name }]);

      if (error) throw error;

      setIsSignedUp(true);
      toast({
        title: "Success!",
        description: "You're on the list! We'll notify you when we launch.",
        variant: "success"
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClick = () => {
    setIsPaymentVisible(true);
    
    // Initialize Stripe checkout
    const stripe = window.Stripe('pk_test_51PshYrH2PkLCQCGsqLe5LyBsOmgHoAkxVmrMJxnmOBK9A5zGtZJBTj6jIQoZnXV7R34HkhjJoivzf7OyHKfBcfYo00i9jB6H1w');

    stripe.redirectToCheckout({
      lineItems: [{
        price: 'price_1PshZ8H2PkLCQCGs6TgfRnyx', // Replace with actual Stripe price ID
        quantity: 1,
      }],
      mode: 'payment',
      successUrl: window.location.origin + '/onboarding?success=true',
      cancelUrl: window.location.origin + '/onboarding?canceled=true',
    })
    .then(function (result) {
      if (result.error) {
        toast({
          title: "Payment Error",
          description: result.error.message || "There was an issue with your payment.",
          variant: "destructive"
        });
        setIsPaymentVisible(false);
      }
    });
  };

  return (
    <AnimatedTransition>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-2 border-border/30 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Idea Forge</CardTitle>
            <CardDescription>
              Join our waiting list while we're building the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignedUp ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-full bg-primary/20 p-3">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">You're on the list!</h3>
                <p className="text-center text-muted-foreground">
                  Thanks for signing up! We'll notify you when we launch.
                </p>
                
                {!isPaymentVisible && (
                  <Button 
                    className="mt-4 w-full" 
                    onClick={handlePaymentClick}
                  >
                    Support Us with £1 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                
                {isPaymentVisible && (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>Redirecting to payment...</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Idea Forge. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </AnimatedTransition>
  );
};

export default Onboarding;
