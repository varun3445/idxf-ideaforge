
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Check, Loader2 } from 'lucide-react';

interface PlanSelectionStepProps {
  selectedPlan: string;
  promoCode?: string;
  onPlanChange: (plan: string) => void;
  onPromoCodeChange?: (code: string) => void;
  onComplete?: () => void;  // Changed type to not expect a specific event
  isLoading?: boolean;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedPlan,
  promoCode = '',
  onPlanChange,
  onPromoCodeChange = () => {},
  onComplete = () => {},
  isLoading = false
}) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Basic access to Idea Forge',
      features: ['Create up to 3 projects', 'Join up to 5 projects', 'Basic collaboration tools']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$9',
      description: 'Enhanced features for serious innovators',
      features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    {
      id: 'business',
      name: 'Business',
      price: '$29',
      description: 'Complete solution for teams and organizations',
      features: ['Team management', 'Enterprise integrations', 'Dedicated support', 'Custom workflows', 'Advanced security']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select a Plan</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`p-4 cursor-pointer relative ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => onPlanChange(plan.id)}
            >
              {selectedPlan === plan.id && (
                <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className="font-bold text-lg">{plan.name}</div>
              <div className="text-2xl font-bold my-2">{plan.price}</div>
              <div className="text-sm text-muted-foreground mb-3">{plan.description}</div>
              <ul className="text-sm space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {onPromoCodeChange && (
        <div className="space-y-2">
          <Label htmlFor="promoCode">Promo Code (optional)</Label>
          <Input
            id="promoCode"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value)}
          />
        </div>
      )}

      <Button 
        type="button"
        className="w-full"
        disabled={isLoading}
        onClick={() => onComplete()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </div>
  );
};

export default PlanSelectionStep;
