
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Star, BadgeDollarSign, Rocket, Zap, Users, Lock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface PlanSelectionStepProps {
  selectedPlan: string;
  promoCode: string;
  onPlanChange: (plan: string) => void;
  onPromoCodeChange: (code: string) => void;
  onComplete: () => void;
  isLoading: boolean;
}

const PlanSelectionStep = ({
  selectedPlan,
  promoCode,
  onPlanChange,
  onPromoCodeChange,
  onComplete,
  isLoading
}: PlanSelectionStepProps) => {
  const { toast } = useToast();
  const [showPromo, setShowPromo] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with your ideas',
      features: [
        'Up to 3 projects',
        'Basic collaboration tools',
        'Community support'
      ],
      icon: <BadgeDollarSign size={24} />,
      mostPopular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99',
      description: 'For serious creators and innovators',
      features: [
        'Unlimited projects',
        'Advanced collaboration features',
        'Priority matching with collaborators',
        'Detailed analytics'
      ],
      icon: <Star size={24} />,
      mostPopular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '$29.99',
      description: 'For teams and organizations',
      features: [
        'Everything in Premium',
        'Team management',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
      icon: <Rocket size={24} />,
      mostPopular: false
    }
  ];

  const handlePromoValidation = () => {
    if (!promoCode.trim()) {
      toast({
        title: "No promo code entered",
        description: "Please enter a promo code to validate",
        variant: "destructive"
      });
      return;
    }

    setValidatingPromo(true);
    
    // Simulating API call to validate promo code
    setTimeout(() => {
      if (promoCode.toLowerCase() === "launch2024") {
        toast({
          title: "Promo code applied!",
          description: "You've received 20% off your subscription",
          variant: "success"
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "This promo code is invalid or expired",
          variant: "destructive"
        });
      }
      setValidatingPromo(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Select the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : ''
            }`}
            onClick={() => onPlanChange(plan.id)}
          >
            <CardHeader className="relative">
              {plan.mostPopular && (
                <Badge className="absolute top-2 right-2 bg-primary text-white">
                  Most Popular
                </Badge>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  {plan.icon}
                </div>
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className="w-full"
                onClick={() => onPlanChange(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        {!showPromo ? (
          <Button variant="link" onClick={() => setShowPromo(true)}>
            Have a promo code?
          </Button>
        ) : (
          <div className="flex flex-col items-center space-y-2 max-w-md mx-auto">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="promoCode">Promo Code</Label>
              <div className="flex w-full gap-2">
                <Input
                  id="promoCode"
                  value={promoCode}
                  onChange={(e) => onPromoCodeChange(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1"
                />
                <Button 
                  onClick={handlePromoValidation}
                  disabled={validatingPromo || !promoCode.trim()}
                >
                  {validatingPromo ? "Validating..." : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-8 pt-6 border-t border-border">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Lock className="h-4 w-4 mr-1" />
          <span>Secure payment processing</span>
        </div>
        <Button 
          className="w-full max-w-md"
          onClick={onComplete}
          disabled={isLoading}
        >
          {isLoading ? "Creating your account..." : "Complete Sign Up"}
        </Button>
      </div>
    </div>
  );
};

export default PlanSelectionStep;
