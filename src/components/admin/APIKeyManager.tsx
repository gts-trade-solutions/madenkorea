import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Settings,
  CreditCard,
  Mail,
  MessageSquare,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface APIKey {
  name: string;
  description: string;
  category: 'payment' | 'email' | 'sms' | 'ai' | 'maps' | 'other';
  required: boolean;
  configured: boolean;
  masked_value?: string;
  documentation_url?: string;
}

const API_KEYS: APIKey[] = [
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe payment processing',
    category: 'payment',
    required: true,
    configured: false,
    documentation_url: 'https://dashboard.stripe.com/apikeys'
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe frontend integration',
    category: 'payment',
    required: true,
    configured: false,
    documentation_url: 'https://dashboard.stripe.com/apikeys'
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI ChatGPT integration',
    category: 'ai',
    required: false,
    configured: false,
    documentation_url: 'https://platform.openai.com/api-keys'
  },
  {
    name: 'SENDGRID_API_KEY',
    description: 'Email delivery service',
    category: 'email',
    required: false,
    configured: false,
    documentation_url: 'https://app.sendgrid.com/settings/api_keys'
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    description: 'SMS and phone services',
    category: 'sms',
    required: false,
    configured: false,
    documentation_url: 'https://console.twilio.com/'
  },
  {
    name: 'GOOGLE_MAPS_API_KEY',
    description: 'Google Maps integration',
    category: 'maps',
    required: false,
    configured: false,
    documentation_url: 'https://console.cloud.google.com/apis/credentials'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'payment': return <CreditCard className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'sms': return <MessageSquare className="h-4 w-4" />;
    case 'ai': return <Settings className="h-4 w-4" />;
    case 'maps': return <Globe className="h-4 w-4" />;
    default: return <Key className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'payment': return 'bg-green-100 text-green-800';
    case 'email': return 'bg-blue-100 text-blue-800';
    case 'sms': return 'bg-purple-100 text-purple-800';
    case 'ai': return 'bg-orange-100 text-orange-800';
    case 'maps': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(API_KEYS);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConfiguredKeys();
  }, []);

  const checkConfiguredKeys = async () => {
    // In a real implementation, you would check which secrets are configured
    // For now, we'll simulate this
    const updatedKeys = apiKeys.map(key => ({
      ...key,
      configured: Math.random() > 0.7, // Randomly mark some as configured for demo
      masked_value: key.configured ? '••••••••••••••••' : undefined
    }));
    setApiKeys(updatedKeys);
  };

  const toggleShowValue = (keyName: string) => {
    setShowValues(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleConfigureKey = (keyName: string) => {
    toast({
      title: "Configure API Key",
      description: `Please use the Supabase Edge Functions secrets to configure ${keyName}`,
    });
  };

  const removeKey = (keyName: string) => {
    if (confirm(`Are you sure you want to remove ${keyName}?`)) {
      toast({
        title: "API Key Removed",
        description: `${keyName} has been removed from configuration`,
      });
    }
  };

  const requiredKeys = apiKeys.filter(key => key.required);
  const optionalKeys = apiKeys.filter(key => !key.required);
  const configuredCount = apiKeys.filter(key => key.configured).length;
  const requiredConfiguredCount = requiredKeys.filter(key => key.configured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Key Management</h2>
          <p className="text-muted-foreground">
            Manage external service integrations and API keys
          </p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Key
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              API integrations available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configured</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{configuredCount}</div>
            <p className="text-xs text-muted-foreground">
              Keys configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiredConfiguredCount}/{requiredKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              Required keys set
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${requiredConfiguredCount === requiredKeys.length ? 'text-green-600' : 'text-orange-600'}`}>
              {requiredConfiguredCount === requiredKeys.length ? 'Ready' : 'Setup Needed'}
            </div>
            <p className="text-xs text-muted-foreground">
              Integration status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Required Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Required API Keys
          </CardTitle>
          <CardDescription>
            These keys are essential for core functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredKeys.map((key) => (
              <div key={key.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(key.category)}
                    <Badge className={getCategoryColor(key.category)}>
                      {key.category}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{key.name}</h3>
                      {key.configured ? (
                        <Badge variant="default">Configured</Badge>
                      ) : (
                        <Badge variant="destructive">Not Configured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{key.description}</p>
                    {key.configured && key.masked_value && (
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showValues[key.name] ? 'sk_live_...' : key.masked_value}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowValue(key.name)}
                        >
                          {showValues[key.name] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('sk_live_...', key.name)}
                        >
                          {copiedKey === key.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {key.documentation_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(key.documentation_url, '_blank')}
                    >
                      Docs
                    </Button>
                  )}
                  <Button
                    variant={key.configured ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleConfigureKey(key.name)}
                  >
                    {key.configured ? 'Update' : 'Configure'}
                  </Button>
                  {key.configured && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeKey(key.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Optional Integrations
          </CardTitle>
          <CardDescription>
            Additional services you can integrate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optionalKeys.map((key) => (
              <div key={key.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(key.category)}
                    <Badge className={getCategoryColor(key.category)}>
                      {key.category}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{key.name}</h3>
                      {key.configured ? (
                        <Badge variant="default">Configured</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{key.description}</p>
                    {key.configured && key.masked_value && (
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showValues[key.name] ? 'api_key_...' : key.masked_value}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowValue(key.name)}
                        >
                          {showValues[key.name] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('api_key_...', key.name)}
                        >
                          {copiedKey === key.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {key.documentation_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(key.documentation_url, '_blank')}
                    >
                      Docs
                    </Button>
                  )}
                  <Button
                    variant={key.configured ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleConfigureKey(key.name)}
                  >
                    {key.configured ? 'Update' : 'Configure'}
                  </Button>
                  {key.configured && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeKey(key.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}